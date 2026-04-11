/**
 * cost-tiers.ts
 * Drug tier → estimated monthly cost ranges and classification logic.
 * Used by Tool 5 (AuditMedCosts) for cost estimation.
 *
 * Tiers are based on typical US insurance formulary categories.
 * All costs are ESTIMATES — actual costs depend on insurance and pharmacy.
 */

export type DrugTier =
  | "generic"
  | "preferred_brand"
  | "non_preferred_brand"
  | "specialty";

export interface CostTierEntry {
  min: number;        // Monthly cost estimate minimum (USD)
  max: number;        // Monthly cost estimate maximum (USD)
  label: string;      // Human-readable range
  tier: DrugTier;
}

export const COST_TIERS: Record<DrugTier, CostTierEntry> = {
  generic: {
    tier: "generic",
    min: 10,
    max: 30,
    label: "$10–30/month",
  },
  preferred_brand: {
    tier: "preferred_brand",
    min: 50,
    max: 150,
    label: "$50–150/month",
  },
  non_preferred_brand: {
    tier: "non_preferred_brand",
    min: 100,
    max: 300,
    label: "$100–300/month",
  },
  specialty: {
    tier: "specialty",
    min: 200,
    max: 999,
    label: "$200+/month",
  },
};

/**
 * Known brand-name drugs and their generic equivalents.
 * Used as a first-pass lookup before calling RxNav API.
 * Key = brand RxNorm RXCUI, value = generic RxNorm RXCUI and name.
 *
 * This list covers the most common hospital discharge medications.
 * RxNav API is the authoritative source — this is a fast-path fallback.
 */
export interface GenericAlternative {
  rxnorm: string;
  name: string;
  tier: DrugTier;
}

export const KNOWN_BRAND_TO_GENERIC: Record<string, GenericAlternative> = {
  // Lipitor 20mg → Atorvastatin 20mg
  "617312": { rxnorm: "259255", name: "Atorvastatin 20mg", tier: "generic" },
  // Lipitor 40mg → Atorvastatin 40mg
  "617311": { rxnorm: "617310", name: "Atorvastatin 40mg", tier: "generic" },
  // Crestor 10mg → Rosuvastatin 10mg
  "476345": { rxnorm: "301542", name: "Rosuvastatin 10mg", tier: "generic" },
  // Zocor 20mg → Simvastatin 20mg
  "312961": { rxnorm: "312960", name: "Simvastatin 20mg", tier: "generic" },
  // Norvasc 5mg → Amlodipine 5mg
  "308135": { rxnorm: "197361", name: "Amlodipine 5mg", tier: "generic" },
  // Zestril 10mg → Lisinopril 10mg
  "314076": { rxnorm: "314076", name: "Lisinopril 10mg", tier: "generic" },
  // Cozaar 50mg → Losartan 50mg
  "203160": { rxnorm: "203159", name: "Losartan 50mg", tier: "generic" },
  // Lasix 40mg → Furosemide 40mg
  "202991": { rxnorm: "202991", name: "Furosemide 40mg", tier: "generic" },
  // Glucophage 500mg → Metformin 500mg
  "860975": { rxnorm: "860975", name: "Metformin 500mg", tier: "generic" },
  // Coumadin 5mg → Warfarin 5mg
  "855332": { rxnorm: "855332", name: "Warfarin 5mg", tier: "generic" },
  // Eliquis 5mg — no generic available (patent-protected as of 2026)
  // Xarelto 20mg — no generic available
  // Advair Diskus → Fluticasone/Salmeterol (generic available)
  "896766": { rxnorm: "896767", name: "Fluticasone/Salmeterol (generic)", tier: "generic" },
  // Prilosec 20mg → Omeprazole 20mg
  "40790": { rxnorm: "40790", name: "Omeprazole 20mg", tier: "generic" },
  // Protonix 40mg → Pantoprazole 40mg
  "114979": { rxnorm: "114979", name: "Pantoprazole 40mg", tier: "generic" },
  // Zoloft 50mg → Sertraline 50mg
  "312938": { rxnorm: "312937", name: "Sertraline 50mg", tier: "generic" },
  // Synthroid 50mcg → Levothyroxine 50mcg
  "196429": { rxnorm: "196429", name: "Levothyroxine 50mcg", tier: "generic" },
  // Neurontin 300mg → Gabapentin 300mg
  "196961": { rxnorm: "196960", name: "Gabapentin 300mg", tier: "generic" },
};

/**
 * Known drugs that are already generic and need no further analysis.
 * These RxNorm codes are skipped during savings analysis (no opportunity).
 */
export const KNOWN_GENERICS = new Set<string>([
  "860975",  // Metformin 500mg
  "861007",  // Metformin 1000mg
  "314076",  // Lisinopril 10mg
  "314077",  // Lisinopril 20mg
  "197361",  // Amlodipine 5mg
  "259255",  // Atorvastatin 20mg
  "312960",  // Simvastatin 20mg
  "301542",  // Rosuvastatin 10mg
  "202991",  // Furosemide 40mg
  "855332",  // Warfarin 5mg
  "40790",   // Omeprazole 20mg
  "114979",  // Pantoprazole 40mg
  "312938",  // Sertraline 50mg (generic)
  "196429",  // Levothyroxine
  "196961",  // Gabapentin
  "198440",  // Acetaminophen 500mg
  "197806",  // Ibuprofen 400mg
  "310489",  // Glipizide
  "243670",  // Aspirin 81mg
  "203160",  // Losartan 50mg
  "312086",  // Ondansetron 4mg
  // Additional SCD codes confirmed via RxNav
  "310965",  // Ibuprofen 400mg
  "308136",  // Amlodipine 5mg (alternate RXCUI)
  "312940",  // Sertraline 50mg (alternate RXCUI)
  "308460",  // Amlodipine 10mg
  "308135",  // Amlodipine 2.5mg
]);

/**
 * Estimates monthly savings between a brand and its generic alternative.
 * Returns a formatted string like "$115".
 */
export function estimateMonthlySavings(brandTier: DrugTier, genericTier: DrugTier): string {
  const brandMid = (COST_TIERS[brandTier].min + COST_TIERS[brandTier].max) / 2;
  const genericMid = (COST_TIERS[genericTier].min + COST_TIERS[genericTier].max) / 2;
  const savings = Math.round(brandMid - genericMid);
  return savings > 0 ? `$${savings}` : "$0";
}

export const DISCLAIMER =
  "Cost estimates are approximate averages. Actual costs depend on your insurance plan, formulary tier, and pharmacy. Ask your pharmacist for your specific out-of-pocket cost.";
