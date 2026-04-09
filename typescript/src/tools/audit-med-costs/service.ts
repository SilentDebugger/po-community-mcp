import { AuditMedCostsInput, AuditMedCostsResult } from "./types";

export async function auditMedCosts(
  _input: AuditMedCostsInput,
): Promise<AuditMedCostsResult> {
  // TODO: Implement medication cost audit logic
  // 1. Filter to active medication requests
  // 2. Skip known generics (from cost-tiers.ts KNOWN_GENERICS)
  // 3. Check KNOWN_BRAND_TO_GENERIC fast-path (from cost-tiers.ts)
  // 4. Fall back to RxNav API (rxnav/client.ts → getRelatedGenerics)
  // 5. Verify alternatives against allergies
  // 6. Estimate savings from tier difference
  // 7. If RxNav unavailable → set apiUnavailable flag, don't error
  throw new Error("Not implemented");
}
