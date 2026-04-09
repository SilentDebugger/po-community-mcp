import {
  DischargeInstructionsInput,
  DischargeInstructionsResult,
} from "./types";

export function generateDischargeInstructions(
  _input: DischargeInstructionsInput,
): DischargeInstructionsResult {
  // TODO: Implement discharge instruction generation
  // 1. Build visit summary from encounter + conditions + procedures
  // 2. Generate medication instructions from med-instructions.ts lookup
  // 3. Map conditions to warning signs from warning-signs.ts
  // 4. Map conditions/procedures to activity restrictions
  // 5. Map conditions to diet guidance
  // 6. Adjust output based on readingLevel (simple/standard/detailed)
  throw new Error("Not implemented");
}
