import { ReadmissionRiskInput, ReadmissionRiskResult } from "./types";

export function assessReadmissionRisk(
  _input: ReadmissionRiskInput,
): ReadmissionRiskResult {
  // TODO: Implement LACE readmission risk calculation
  // L — length of stay in days → 0-5 pts (from encounter.period)
  // A — admitted via ER? → 0 or 3 pts (check encounter class history)
  // C — Charlson comorbidity sum from charlson-mapping.ts → 0-5 pts
  // E — ER visits in past 6 months → 0-4 pts (filter allEncounters by class=EMER)
  throw new Error("Not implemented");
}
