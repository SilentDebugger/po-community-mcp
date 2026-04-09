import { fhirR4 } from "@smile-cdr/fhirts";
import { ReconcileMedicationsResult } from "../reconcile-medications/types";
import { DischargeInstructionsResult } from "../discharge-instructions/types";
import { ReadmissionRiskResult } from "../readmission-risk/types";
import { FollowUpPlanResult } from "../follow-up-plan/types";
import { AuditMedCostsResult } from "../audit-med-costs/types";

export type SubToolResult<T> = T | { error: string };

export interface DischargePacketResult {
  patient: fhirR4.Patient;
  encounter: fhirR4.Encounter;
  medicationReconciliation: SubToolResult<ReconcileMedicationsResult>;
  dischargeInstructions: SubToolResult<DischargeInstructionsResult>;
  readmissionRisk: SubToolResult<ReadmissionRiskResult>;
  followUpPlan: SubToolResult<FollowUpPlanResult>;
  costSavings: SubToolResult<AuditMedCostsResult>;
  generatedAt: string;
  disclaimer: string;
}
