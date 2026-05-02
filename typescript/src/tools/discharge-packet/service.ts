import { DischargeFhirData } from "../../fhir/queries";
import { reconcileMedications } from "../reconcile-medications/service";
import { generateDischargeInstructions, ASK_CARE_TEAM_REMINDER } from "../discharge-instructions/service";
import { assessReadmissionRisk } from "../readmission-risk/service";
import { planFollowUp } from "../follow-up-plan/service";
import { auditMedCosts } from "../audit-med-costs/service";
import { ReadingLevel } from "../discharge-instructions/types";
import { ClinicianInstructions, PatientInstructions } from "../discharge-instructions/types";
import { FollowUpItem } from "../follow-up-plan/types";
import { expandFollowUpItem } from "../follow-up-plan/service";
import {
  DischargePacketResult,
  SimplifiedFollowUpItem,
  SubToolResult,
} from "./types";

const DISCLAIMER =
  "This discharge packet is generated from structured clinical data and deterministic rules. " +
  "It is not a substitute for clinical judgment. All information should be reviewed by a qualified healthcare provider.";

const EMPTY_CLINICIAN: ClinicianInstructions = {
  visitSummary: "",
  diagnoses: [],
  procedures: [],
  lengthOfStay: null,
  medications: [],
};

const EMPTY_PATIENT: PatientInstructions = {
  visitSummary: "",
  medications: [],
  warningSigns: [],
  activityRestrictions: [],
  dietGuidance: "",
  askCareTeamReminder: ASK_CARE_TEAM_REMINDER,
};

function isError<T>(result: SubToolResult<T>): result is { error: string } {
  return typeof result === "object" && result !== null && "error" in result;
}

/**
 * Expands abbreviations on a raw FollowUpItem then flattens it into a single
 * patient-readable line. Tests and study name are folded into the reason;
 * specialty and priority are dropped entirely.
 */
function simplifyFollowUpItem(item: FollowUpItem): SimplifiedFollowUpItem {
  const expanded = expandFollowUpItem(item);
  let reason = expanded.reason;

  if (expanded.type === "lab" && expanded.tests && expanded.tests.length > 0) {
    reason = `Lab work (${expanded.tests.join(", ")}): ${reason}`;
  } else if (expanded.type === "imaging" && expanded.study) {
    reason = `${expanded.study}: ${reason}`;
  }

  return { timeframe: expanded.timeframe, reason };
}

export async function buildDischargePacket(
  data: DischargeFhirData,
  readingLevel: ReadingLevel,
): Promise<DischargePacketResult> {
  const [
    medicationReconciliation,
    dischargeInstructions,
    readmissionRisk,
    followUpPlan,
    costSavings,
  ] = await Promise.all([
    runSafe(() =>
      reconcileMedications({
        encounter: data.encounter,
        medicationRequests: data.medicationRequests,
        allergyIntolerances: data.allergyIntolerances,
      }),
    ),
    runSafe(() =>
      generateDischargeInstructions({
        readingLevel,
        patient: data.patient,
        encounter: data.encounter,
        conditions: data.conditions,
        procedures: data.procedures,
        medicationRequests: data.medicationRequests,
      }),
    ),
    runSafe(() =>
      assessReadmissionRisk({
        encounter: data.encounter,
        erEncounters: data.erEncounters,
        conditions: data.conditions,
      }),
    ),
    runSafe(() =>
      planFollowUp(
        {
          conditions: data.conditions,
          procedures: data.procedures,
          observations: data.observations,
          carePlans: data.carePlans,
        },
        false, // orchestrator expands patient path itself; clinician packet keeps raw abbreviations
      ),
    ),
    runSafe(() =>
      auditMedCosts({
        medicationRequests: data.medicationRequests,
        allergyIntolerances: data.allergyIntolerances,
      }),
    ),
  ]);

  const clinicalSummary = isError(dischargeInstructions)
    ? EMPTY_CLINICIAN
    : dischargeInstructions.clinician;

  const rawPatientInstructions = isError(dischargeInstructions)
    ? EMPTY_PATIENT
    : dischargeInstructions.patient;

  // Annotate patient medications with change type from reconciliation result.
  const patientInstructions = (() => {
    if (isError(medicationReconciliation)) return rawPatientInstructions;
    const newRxNorms = new Set(medicationReconciliation.reconciliation.new.map((m) => m.rxnorm));
    const changedRxNorms = new Set(medicationReconciliation.reconciliation.changed.map((m) => m.rxnorm));
    return {
      ...rawPatientInstructions,
      medications: rawPatientInstructions.medications.map((med) => ({
        ...med,
        changeType: newRxNorms.has(med.rxNorm ?? "")
          ? ("new" as const)
          : changedRxNorms.has(med.rxNorm ?? "")
            ? ("changed" as const)
            : ("continued" as const),
      })),
    };
  })();

  const followUpAppointments = isError(followUpPlan)
    ? []
    : followUpPlan.followUpItems.map(simplifyFollowUpItem);

  return {
    patient: data.patient,
    encounter: data.encounter,
    clinicianPacket: {
      clinicalSummary,
      medicationReconciliation,
      readmissionRisk,
      followUpPlan,
      costSavings,
    },
    patientPacket: {
      instructions: patientInstructions,
      followUpAppointments,
    },
    generatedAt: new Date().toISOString(),
    disclaimer: DISCLAIMER,
  };
}

async function runSafe<T>(
  fn: () => T | Promise<T>,
): Promise<SubToolResult<T>> {
  try {
    return await fn();
  } catch (error) {
    return { error: error instanceof Error ? error.message : String(error) };
  }
}
