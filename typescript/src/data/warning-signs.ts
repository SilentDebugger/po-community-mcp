/**
 * Warning signs mapped to conditions for GenerateDischargeInstructions tool.
 * Maps SNOMED/ICD-10 codes to patient-friendly warning sign descriptions.
 */

export interface WarningSignEntry {
  conditionCode: string;
  conditionName: string;
  signs: {
    simple: string[];
    standard: string[];
    detailed: string[];
  };
}

export const CONDITION_WARNING_SIGNS: WarningSignEntry[] = [
  // TODO: Populate with condition-specific warning signs
];
