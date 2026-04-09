/**
 * Charlson Comorbidity Index mapping.
 * Maps ICD-10 code prefixes to comorbidity weights.
 * Used by AssessReadmissionRisk tool.
 *
 * Reference: Charlson ME, et al. J Chronic Dis. 1987;40(5):373-383.
 */

export interface CharlsonCondition {
  name: string;
  weight: number;
  icd10Prefixes: string[];
  snomedCodes: string[];
}

export const CHARLSON_CONDITIONS: CharlsonCondition[] = [
  // TODO: Populate from Charlson Comorbidity Index literature
  // {
  //   name: "Myocardial infarction",
  //   weight: 1,
  //   icd10Prefixes: ["I21", "I22", "I25.2"],
  //   snomedCodes: ["22298006"],
  // },
];
