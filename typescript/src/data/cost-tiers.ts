/**
 * Medication cost tier data for AuditMedCosts tool.
 */

export const KNOWN_GENERICS = new Set<string>([
  // TODO: Populate with RxNorm codes of known generics
]);

export const KNOWN_BRAND_TO_GENERIC: Record<string, string> = {
  // TODO: Populate brand RxNorm code → generic RxNorm code
};

export type CostTier = 1 | 2 | 3 | 4;

export const COST_TIER_MONTHLY_ESTIMATE: Record<CostTier, number> = {
  1: 10,
  2: 40,
  3: 80,
  4: 150,
};
