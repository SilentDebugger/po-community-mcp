import { fhirR4 } from "@smile-cdr/fhirts";

export interface SavingsOpportunity {
  currentMedication: string;
  suggestedAlternative: string;
  estimatedMonthlySavings: number;
  reason: string;
}

export interface AuditMedCostsResult {
  savingsOpportunities: SavingsOpportunity[];
  totalEstimatedMonthlySavings: number;
  noChangeNeeded: string[];
  unanalyzed: string[];
  disclaimer: string;
}

export interface AuditMedCostsInput {
  medicationRequests: fhirR4.MedicationRequest[];
  allergyIntolerances: fhirR4.AllergyIntolerance[];
}
