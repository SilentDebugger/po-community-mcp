import { fhirR4 } from "@smile-cdr/fhirts";

export type ReadingLevel = "simple" | "standard" | "detailed";

export interface MedicationInstruction {
  name: string;
  dosage: string;
  frequency: string;
  instructions: string;
  warnings?: string[];
}

export interface DischargeInstructionsResult {
  visitSummary: string;
  medications: MedicationInstruction[];
  warningSigns: string[];
  activityRestrictions: string[];
  dietGuidance: string;
}

export interface DischargeInstructionsInput {
  readingLevel: ReadingLevel;
  patient: fhirR4.Patient;
  encounter: fhirR4.Encounter;
  conditions: fhirR4.Condition[];
  procedures: fhirR4.Procedure[];
  medicationRequests: fhirR4.MedicationRequest[];
}
