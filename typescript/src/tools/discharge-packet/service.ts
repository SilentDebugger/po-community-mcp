import { DischargeFhirData } from "../../fhir/queries";
import { reconcileMedications } from "../reconcile-medications/service";
import { generateDischargeInstructions } from "../discharge-instructions/service";
import { assessReadmissionRisk } from "../readmission-risk/service";
import { planFollowUp } from "../follow-up-plan/service";
import { auditMedCosts } from "../audit-med-costs/service";
import { ReadingLevel } from "../discharge-instructions/types";
import { DischargePacketResult, SubToolResult } from "./types";

const DISCLAIMER =
  "This discharge packet is generated from structured clinical data and deterministic rules. " +
  "It is not a substitute for clinical judgment. All information should be reviewed by a qualified healthcare provider.";

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

  return {
    patient: data.patient,
    encounter: data.encounter,
    medicationReconciliation,
    dischargeInstructions,
    readmissionRisk,
    followUpPlan,
    costSavings,
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
