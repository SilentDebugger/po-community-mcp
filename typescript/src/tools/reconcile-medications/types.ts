import { fhirR4 } from "@smile-cdr/fhirts";

export interface MedicationChange {
  medication: string;
  rxNormCode?: string;
  previousDosage?: string;
  currentDosage?: string;
}

export interface ReconcileMedicationsResult {
  reconciliation: {
    new: MedicationChange[];
    stopped: MedicationChange[];
    changed: MedicationChange[];
    continued: MedicationChange[];
  };
  interactionWarnings: string[];
  allergyConflicts: string[];
}

export interface ReconcileMedicationsInput {
  encounter: fhirR4.Encounter;
  medicationRequests: fhirR4.MedicationRequest[];
  allergyIntolerances: fhirR4.AllergyIntolerance[];
}
