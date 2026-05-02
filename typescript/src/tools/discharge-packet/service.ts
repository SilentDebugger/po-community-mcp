import { DischargeFhirData } from "../../fhir/queries";
import { reconcileMedications } from "../reconcile-medications/service";
import { generateDischargeInstructions } from "../discharge-instructions/service";
import { assessReadmissionRisk } from "../readmission-risk/service";
import { planFollowUp } from "../follow-up-plan/service";
import { auditMedCosts } from "../audit-med-costs/service";
import { ReadingLevel } from "../discharge-instructions/types";
import { ClinicianInstructions, PatientInstructions } from "../discharge-instructions/types";
import { FollowUpItem } from "../follow-up-plan/types";
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
  askCareTeamReminder:
    "Before you leave the hospital, please ask your care team about: driving, bathing, wound care, and when you can return to work.",
};

function isError<T>(result: SubToolResult<T>): result is { error: string } {
  return typeof result === "object" && result !== null && "error" in result;
}

/**
 * Flattens a FollowUpItem into a single patient-readable line.
 * Tests and study name are folded into the reason; specialty and priority are dropped.
 */
function simplifyFollowUpItem(item: FollowUpItem): SimplifiedFollowUpItem {
  let reason = item.reason;

  if (item.type === "lab" && item.tests && item.tests.length > 0) {
    reason = `Lab work (${item.tests.join(", ")}): ${reason}`;
  } else if (item.type === "imaging" && item.study) {
    reason = `${item.study}: ${reason}`;
  }

  return { timeframe: item.timeframe, reason };
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
      planFollowUp({
        conditions: data.conditions,
        procedures: data.procedures,
        observations: data.observations,
        carePlans: data.carePlans,
      }),
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

  const patientInstructions = isError(dischargeInstructions)
    ? EMPTY_PATIENT
    : dischargeInstructions.patient;

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
