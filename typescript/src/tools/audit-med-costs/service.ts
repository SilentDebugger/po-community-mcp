import { AuditMedCostsInput, AuditMedCostsResult, SavingsOpportunity } from "./types";
import {
  DISCLAIMER,
  KNOWN_BRAND_TO_GENERIC,
  KNOWN_GENERICS,
  estimateMonthlySavings,
} from "../../data/cost-tiers";
import { getRelatedGenerics } from "../../external/rxnav/client";
import { fhirR4 } from "@smile-cdr/fhirts";
import { RxNavRelatedGroup } from "../../external/rxnav/types";

const RXNORM_SYSTEM = "http://www.nlm.nih.gov/research/umls/rxnorm";

interface ParsedMed {
  name: string;
  rxcui: string;
}

function parseMedication(med: fhirR4.MedicationRequest): ParsedMed | null {
  const concept = med.medicationCodeableConcept;
  const rxnormCoding = concept?.coding?.find((c) => c.system === RXNORM_SYSTEM);
  const name = concept?.text ?? rxnormCoding?.display ?? "Unknown medication";
  const rxcui = rxnormCoding?.code;
  return rxcui ? { name, rxcui } : null;
}

function buildAllergySet(allergyIntolerances: fhirR4.AllergyIntolerance[]): Set<string> {
  const rxcuis = new Set<string>();
  for (const allergy of allergyIntolerances) {
    for (const reaction of allergy.reaction ?? []) {
      for (const coding of reaction.substance?.coding ?? []) {
        if (coding.system === RXNORM_SYSTEM && coding.code) {
          rxcuis.add(coding.code);
        }
      }
    }
  }
  return rxcuis;
}

export async function auditMedCosts(input: AuditMedCostsInput): Promise<AuditMedCostsResult> {
  const { medicationRequests, allergyIntolerances } = input;
  const allergyRxCuis = buildAllergySet(allergyIntolerances);

  const savingsOpportunities: SavingsOpportunity[] = [];
  const noChangeNeeded: string[] = [];
  const unanalyzed: string[] = [];

  // Phase 1: categorize meds using local data; collect those needing RxNav
  const needsRxNav: ParsedMed[] = [];

  for (const med of medicationRequests) {
    const parsed = parseMedication(med);
    if (!parsed) {
      const name = med.medicationCodeableConcept?.text ?? "Unknown medication";
      noChangeNeeded.push(name);
      continue;
    }

    const { name, rxcui } = parsed;

    if (KNOWN_GENERICS.has(rxcui)) {
      noChangeNeeded.push(name);
      continue;
    }

    const knownGeneric = KNOWN_BRAND_TO_GENERIC[rxcui];
    if (knownGeneric) {
      if (allergyRxCuis.has(knownGeneric.rxnorm)) {
        noChangeNeeded.push(name);
        continue;
      }
      const savings = estimateMonthlySavings("non_preferred_brand", knownGeneric.tier);
      if (savings > 0) {
        savingsOpportunities.push({
          currentMedication: name,
          suggestedAlternative: knownGeneric.name,
          estimatedMonthlySavings: savings,
          reason: "Switch from brand-name to generic equivalent",
        });
      } else {
        noChangeNeeded.push(name);
      }
      continue;
    }

    needsRxNav.push(parsed);
  }

  // Phase 2: parallel RxNav lookups
  const rxnavResults = await Promise.all(
    needsRxNav.map(async (med) => ({
      med,
      related: await getRelatedGenerics(med.rxcui),
    })),
  );

  let rxnavUnreachable = false;

  for (const { med, related } of rxnavResults) {
    if (related === null) {
      rxnavUnreachable = true;
      unanalyzed.push(med.name);
      continue;
    }

    if (related.some((r) => r.rxcui === med.rxcui && r.tty === "SCD")) {
      noChangeNeeded.push(med.name);
      continue;
    }

    const doseStr = med.name.match(/(\d+(?:\.\d+)?)\s*MG/i)?.[1] ?? null;

    const genericAlt = findSafeGeneric(related, allergyRxCuis, doseStr);
    if (genericAlt) {
      const savings = estimateMonthlySavings("non_preferred_brand", "generic");
      if (savings > 0) {
        savingsOpportunities.push({
          currentMedication: med.name,
          suggestedAlternative: genericAlt.name,
          estimatedMonthlySavings: savings,
          reason: "Switch from brand-name to generic equivalent",
        });
      } else {
        noChangeNeeded.push(med.name);
      }
    } else {
      noChangeNeeded.push(med.name);
    }
  }

  const totalEstimatedMonthlySavings = savingsOpportunities.reduce(
    (sum, opp) => sum + opp.estimatedMonthlySavings,
    0,
  );

  const disclaimer = rxnavUnreachable
    ? `${DISCLAIMER} Note: some medications could not be analyzed because the external drug database was unreachable.`
    : DISCLAIMER;

  return { savingsOpportunities, totalEstimatedMonthlySavings, noChangeNeeded, unanalyzed, disclaimer };
}

function findSafeGeneric(
  related: RxNavRelatedGroup[],
  allergyRxCuis: Set<string>,
  doseStr: string | null,
): RxNavRelatedGroup | undefined {
  return related.find(
    (r) =>
      r.tty === "SCD" &&
      !allergyRxCuis.has(r.rxcui) &&
      (doseStr === null || r.name.includes(doseStr)),
  );
}
