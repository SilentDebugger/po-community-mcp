/**
 * Medication instruction templates for GenerateDischargeInstructions tool.
 * Keyed by drug class or RxNorm code.
 */

export interface MedInstructionTemplate {
  drugClass: string;
  rxNormCodes: string[];
  instructions: {
    simple: string;
    standard: string;
    detailed: string;
  };
  warnings: string[];
}

export const MED_INSTRUCTION_TEMPLATES: MedInstructionTemplate[] = [
  // TODO: Populate with medication instruction templates
];
