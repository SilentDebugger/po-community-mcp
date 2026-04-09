import {
  ReconcileMedicationsInput,
  ReconcileMedicationsResult,
} from "./types";

export function reconcileMedications(
  _input: ReconcileMedicationsInput,
): ReconcileMedicationsResult {
  // TODO: Implement medication reconciliation logic
  // 1. Split meds by authoredOn vs encounter start date
  // 2. Match by RxNorm code
  // 3. Diff dosages to categorize as new/stopped/changed/continued
  // 4. Check for interaction warnings
  // 5. Check for allergy conflicts
  throw new Error("Not implemented");
}
