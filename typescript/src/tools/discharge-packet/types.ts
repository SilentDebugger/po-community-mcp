import { fhirR4 } from "@smile-cdr/fhirts";
import { ReconcileMedicationsOutput } from "../reconcile-medications/types";
import { ClinicianInstructions, PatientInstructions } from "../discharge-instructions/types";
import { ReadmissionRiskResult } from "../readmission-risk/types";
import { FollowUpPlanResult } from "../follow-up-plan/types";
import { AuditMedCostsResult } from "../audit-med-costs/types";

export type SubToolResult<T> = T | { error: string };

/** A follow-up item stripped down to what a patient needs to act on. */
export interface SimplifiedFollowUpItem {
  timeframe: string;
  reason: string;
}

export interface ClinicianPacket {
  clinicalSummary: ClinicianInstructions;
  medicationReconciliation: SubToolResult<ReconcileMedicationsOutput>;
  readmissionRisk: SubToolResult<ReadmissionRiskResult>;
  followUpPlan: SubToolResult<FollowUpPlanResult>;
  costSavings: SubToolResult<AuditMedCostsResult>;
}

export interface PatientPacket {
  instructions: PatientInstructions;
  /** Simplified follow-up items — no specialty jargon, just timeframe + plain reason. */
  followUpAppointments: SimplifiedFollowUpItem[];
}

export interface DischargePacketResult {
  patient: fhirR4.Patient;
  encounter: fhirR4.Encounter;
  clinicianPacket: ClinicianPacket;
  patientPacket: PatientPacket;
  generatedAt: string;
  disclaimer: string;
}
