import { fhirR4 } from "@smile-cdr/fhirts";

export type ReadingLevel = "simple" | "standard" | "detailed";

export interface MedicationInstruction {
  name: string;
  rxNorm?: string;
  dosage: string;
  frequency: string;
  instructions: string;
  warnings?: string[];
  /** Populated by the discharge-packet orchestrator after reconciliation. */
  changeType?: "new" | "changed" | "continued";
}

export interface ClinicianInstructions {
  /** Full clinical detail — no jargon expansion, raw FHIR text preserved. */
  visitSummary: string;
  diagnoses: string[];
  procedures: string[];
  lengthOfStay: number | null;
  medications: MedicationInstruction[];
}

export interface PatientInstructions {
  /** Second-person ("you/your") tone, all abbreviations expanded. */
  visitSummary: string;
  medications: MedicationInstruction[];
  warningSigns: string[];
  activityRestrictions: string[];
  dietGuidance: string;
  /** Universal hardcoded reminder appended to every patient packet. */
  askCareTeamReminder: string;
}

export interface DischargeInstructionsResult {
  clinician: ClinicianInstructions;
  patient: PatientInstructions;
}

export interface DischargeInstructionsInput {
  readingLevel: ReadingLevel;
  patient: fhirR4.Patient;
  encounter: fhirR4.Encounter;
  conditions: fhirR4.Condition[];
  procedures: fhirR4.Procedure[];
  medicationRequests: fhirR4.MedicationRequest[];
}
