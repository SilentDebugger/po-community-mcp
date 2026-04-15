import { fhirR4 } from "@smile-cdr/fhirts";
import {
  CONDITION_FOLLOW_UP_RULES,
  PROCEDURE_FOLLOW_UP_RULES,
} from "../../data/follow-up-rules";
import { MEDICAL_ABBREVIATIONS } from "../../data/medical-abbreviations";
import type { FollowUpItem, FollowUpPlanInput, FollowUpPlanResult } from "./types";

const SNOMED_SYSTEM = "http://snomed.info/sct";
const ABNORMAL_CODES = new Set(["H", "L", "HH", "LL"]);
const ESCALATION_PRIORITIES = new Set<string>(["high", "urgent", "emergent"]);

const ABBREVIATION_REGEX = new RegExp(
  `\\b(${Object.keys(MEDICAL_ABBREVIATIONS).map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})\\b`,
  "g",
);

// ── Helpers ─────────────────────────────────────────────────────────────────

function getSnomedCode(coding?: fhirR4.Coding[]): string | undefined {
  return coding?.find((c) => c.system === SNOMED_SYSTEM)?.code;
}

/**
 * Builds a set of normalized coverage tokens from active CarePlans.
 * Used to filter out follow-up items the patient is already enrolled in.
 */
function buildCarePlanCoverage(carePlans: fhirR4.CarePlan[]): Set<string> {
  const tokens = new Set<string>();

  for (const plan of carePlans) {
    if (plan.status !== "active") continue;

    for (const cat of plan.category ?? []) {
      cat.coding?.forEach((c) => {
        if (c.display) tokens.add(c.display.toLowerCase());
        if (c.code) tokens.add(c.code.toLowerCase());
      });
      if (cat.text) tokens.add(cat.text.toLowerCase());
    }

    for (const activity of plan.activity ?? []) {
      const detail = activity.detail;
      if (!detail) continue;

      detail.code?.coding?.forEach((c) => {
        if (c.display) tokens.add(c.display.toLowerCase());
        if (c.code) tokens.add(c.code.toLowerCase());
      });
      if (detail.description) tokens.add(detail.description.toLowerCase());
    }
  }

  return tokens;
}

function isCoveredByCarePlan(item: FollowUpItem, coverage: Set<string>): boolean {
  const candidates = [
    item.specialty?.toLowerCase(),
    item.study?.toLowerCase(),
    ...(item.tests?.map((t) => t.toLowerCase()) ?? []),
  ].filter((v): v is string => Boolean(v));

  for (const c of candidates) {
    for (const token of coverage) {
      if (token.includes(c) || c.includes(token)) return true;
    }
  }
  return false;
}

// ── Abbreviation expansion (patient-facing output) ──────────────────────────

function expandText(text: string): string {
  ABBREVIATION_REGEX.lastIndex = 0;
  return text.replace(
    ABBREVIATION_REGEX,
    (match) => MEDICAL_ABBREVIATIONS[match] ?? match,
  );
}

function expandItem(item: FollowUpItem): FollowUpItem {
  return {
    ...item,
    reason: expandText(item.reason),
    ...(item.specialty && { specialty: expandText(item.specialty) }),
    ...(item.tests && { tests: item.tests.map((t) => MEDICAL_ABBREVIATIONS[t] ?? expandText(t)) }),
  };
}

// ── Core logic ───────────────────────────────────────────────────────────────

export function planFollowUp(input: FollowUpPlanInput): FollowUpPlanResult {
  const items: FollowUpItem[] = [];

  // 1 — Conditions → SNOMED lookup with fallback to "default" rule
  for (const condition of input.conditions) {
    const code = getSnomedCode(condition.code?.coding);
    const rule =
      (code ? CONDITION_FOLLOW_UP_RULES[code] : undefined) ??
      CONDITION_FOLLOW_UP_RULES["default"]!;

    rule.items.forEach((item: FollowUpItem) => items.push({ ...item }));
  }

  // 2 — Procedures → SNOMED lookup (no fallback; skip unrecognised codes)
  for (const procedure of input.procedures) {
    const code = getSnomedCode(procedure.code?.coding);
    if (!code) continue;

    const rule = PROCEDURE_FOLLOW_UP_RULES[code];
    if (!rule) continue;

    rule.items.forEach((item) => items.push({ ...item }));
  }

  // 3 — Observations → repeat labs for abnormal results
  for (const obs of input.observations) {
    const isAbnormal = obs.interpretation?.some((interp) =>
      interp.coding?.some((c) => ABNORMAL_CODES.has(c.code ?? "")),
    );
    if (!isAbnormal) continue;

    const testName =
      obs.code?.coding?.find((c) => c.display)?.display ??
      obs.code?.text ??
      "Lab test";

    items.push({
      type: "lab",
      tests: [testName],
      timeframe: "2 weeks",
      reason: `Repeat ${testName} — abnormal result at discharge`,
      priority: "routine",
    });
  }

  // 4 — Remove items already covered by active CarePlans
  const coverage = buildCarePlanCoverage(input.carePlans);
  const filtered = coverage.size > 0
    ? items.filter((item) => !isCoveredByCarePlan(item, coverage))
    : items;

  // 5 — Deduplicate: keep first occurrence per type + specialty/study key
  const seen = new Set<string>();
  const followUpItems = filtered.filter((item) => {
    const testsKey = item.tests ? [...item.tests].sort().join(",") : "";
    const key = `${item.type}|${item.specialty ?? ""}|${item.study ?? ""}|${testsKey}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // 6 — Readmission risk note
  const escalatedCount = followUpItems.filter((i) =>
    ESCALATION_PRIORITIES.has(i.priority),
  ).length;

  const readmissionRiskNote =
    escalatedCount >= 3
      ? "Multiple high-priority follow-ups required — elevated readmission risk. Ensure timely care coordination."
      : "Standard follow-up plan. Monitor for symptom recurrence.";

  return { followUpItems: followUpItems.map(expandItem), readmissionRiskNote };
}
