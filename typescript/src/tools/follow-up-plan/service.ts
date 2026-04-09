import { FollowUpPlanInput, FollowUpPlanResult } from "./types";

export function planFollowUp(_input: FollowUpPlanInput): FollowUpPlanResult {
  // TODO: Implement follow-up planning logic
  // 1. Match SNOMED codes against follow-up-rules.ts (condition + procedure tables)
  // 2. De-duplicate against active CarePlans
  // 3. Merge same-specialty items
  // 4. Keep shortest timeframe when merging
  throw new Error("Not implemented");
}
