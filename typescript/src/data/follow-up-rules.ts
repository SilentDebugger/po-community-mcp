/**
 * follow-up-rules.ts
 * SNOMED condition code / procedure code → structured follow-up recommendations.
 * Used by Tool 4 (PlanFollowUp).
 *
 * Guidelines basis: standard post-discharge care protocols.
 */

import type { FollowUpItem } from "../tools/follow-up-plan/types";

export interface FollowUpRule {
  items: FollowUpItem[];
}

// ── Condition-based follow-up rules (keyed by SNOMED code) ─────────────────

export const CONDITION_FOLLOW_UP_RULES: Record<string, FollowUpRule> = {

  // ── Pneumonia ────────────────────────────────────────────────────────────
  "233604007": {
    items: [
      {
        type: "visit",
        specialty: "Primary Care",
        timeframe: "5–7 days",
        reason: "Post-pneumonia recovery check, confirm resolution",
        priority: "high",
      },
      {
        type: "imaging",
        study: "Chest X-ray",
        timeframe: "4–6 weeks post-discharge",
        reason: "Confirm pneumonia resolution and rule out underlying pathology",
        priority: "routine",
      },
      {
        type: "lab",
        tests: ["CBC"],
        timeframe: "2 weeks",
        reason: "Monitor white blood cell count if elevated at discharge",
        priority: "routine",
      },
    ],
  },

  // ── Congestive heart failure ──────────────────────────────────────────────
  "84114007": {
    items: [
      {
        type: "visit",
        specialty: "Cardiology",
        timeframe: "7 days",
        reason: "Post-CHF exacerbation follow-up, medication review",
        priority: "high",
      },
      {
        type: "monitoring",
        timeframe: "Daily — ongoing",
        reason: "Daily weight monitoring — report gain of >2 lbs/day or >5 lbs/week to doctor",
        priority: "high",
      },
      {
        type: "lab",
        tests: ["BMP", "BNP"],
        timeframe: "1 week",
        reason: "Electrolytes and fluid status after diuretic therapy",
        priority: "high",
      },
      {
        type: "visit",
        specialty: "Primary Care",
        timeframe: "2 weeks",
        reason: "Medication titration review",
        priority: "routine",
      },
    ],
  },

  // ── Type 2 diabetes mellitus ─────────────────────────────────────────────
  "44054006": {
    items: [
      {
        type: "visit",
        specialty: "Primary Care or Endocrinology",
        timeframe: "2 weeks",
        reason: "Diabetes management review, medication adjustment",
        priority: "high",
      },
      {
        type: "lab",
        tests: ["HbA1c", "BMP", "Fasting glucose"],
        timeframe: "3 months",
        reason: "Routine diabetes monitoring",
        priority: "routine",
      },
      {
        type: "monitoring",
        timeframe: "Daily — ongoing",
        reason: "Home blood glucose monitoring as directed by care team",
        priority: "routine",
      },
    ],
  },

  // ── Hypertension ─────────────────────────────────────────────────────────
  "38341003": {
    items: [
      {
        type: "visit",
        specialty: "Primary Care",
        timeframe: "1–2 weeks",
        reason: "Blood pressure recheck, medication effectiveness review",
        priority: "high",
      },
      {
        type: "lab",
        tests: ["BMP"],
        timeframe: "2 weeks",
        reason: "Electrolytes and renal function if antihypertensive was changed",
        priority: "routine",
      },
      {
        type: "monitoring",
        timeframe: "Daily — 2 weeks",
        reason: "Home blood pressure monitoring twice daily, log readings",
        priority: "routine",
      },
    ],
  },

  // ── Acute kidney injury ───────────────────────────────────────────────────
  "14669001": {
    items: [
      {
        type: "lab",
        tests: ["BMP", "Creatinine", "BUN", "Urinalysis"],
        timeframe: "2–3 days",
        reason: "Renal function recheck — AKI may continue to evolve after discharge",
        priority: "high",
      },
      {
        type: "visit",
        specialty: "Nephrology",
        timeframe: "1–2 weeks",
        reason: "Nephrology referral if creatinine is not returning to baseline",
        priority: "high",
      },
      {
        type: "visit",
        specialty: "Primary Care",
        timeframe: "1 week",
        reason: "Medication review — many drugs require renal dose adjustment",
        priority: "high",
      },
    ],
  },

  // ── COPD ─────────────────────────────────────────────────────────────────
  "13645005": {
    items: [
      {
        type: "visit",
        specialty: "Primary Care or Pulmonology",
        timeframe: "1–2 weeks",
        reason: "Post-exacerbation follow-up, inhaler technique review",
        priority: "high",
      },
      {
        type: "monitoring",
        timeframe: "Ongoing",
        reason: "Daily peak flow or symptom diary if prescribed",
        priority: "routine",
      },
      {
        type: "visit",
        specialty: "Pulmonology",
        timeframe: "4–6 weeks",
        reason: "Pulmonary function testing and long-term management plan",
        priority: "routine",
      },
    ],
  },

  // ── Stroke / cerebrovascular disease ─────────────────────────────────────
  "230690007": {
    items: [
      {
        type: "visit",
        specialty: "Neurology",
        timeframe: "1–2 weeks",
        reason: "Stroke follow-up, anticoagulation or antiplatelet review",
        priority: "high",
      },
      {
        type: "visit",
        specialty: "Primary Care",
        timeframe: "1 week",
        reason: "Blood pressure and risk factor management",
        priority: "high",
      },
      {
        type: "visit",
        specialty: "Physical Therapy / Occupational Therapy",
        timeframe: "Within 1 week",
        reason: "Rehabilitation assessment for functional deficits",
        priority: "high",
      },
    ],
  },

  // ── Myocardial infarction / heart attack ──────────────────────────────────
  "22298006": {
    items: [
      {
        type: "visit",
        specialty: "Cardiology",
        timeframe: "1–2 weeks",
        reason: "Post-MI follow-up, medication review, cardiac rehab referral",
        priority: "high",
      },
      {
        type: "lab",
        tests: ["Lipid panel", "BMP", "HbA1c"],
        timeframe: "4–6 weeks",
        reason: "Cardiovascular risk factor monitoring",
        priority: "routine",
      },
      {
        type: "visit",
        specialty: "Cardiac Rehabilitation",
        timeframe: "2–4 weeks",
        reason: "Structured exercise and lifestyle modification program",
        priority: "routine",
      },
    ],
  },

  // ── Atrial fibrillation ───────────────────────────────────────────────────
  "49436004": {
    items: [
      {
        type: "visit",
        specialty: "Cardiology",
        timeframe: "1–2 weeks",
        reason: "Rate/rhythm control review, anticoagulation management",
        priority: "high",
      },
      {
        type: "lab",
        tests: ["INR"],
        timeframe: "3–5 days",
        reason: "INR check if on warfarin",
        priority: "high",
      },
      {
        type: "monitoring",
        timeframe: "Ongoing",
        reason: "Home pulse monitoring — report sustained irregular or very rapid heartbeat",
        priority: "routine",
      },
    ],
  },

  // ── Fracture ──────────────────────────────────────────────────────────────
  "125605004": {
    items: [
      {
        type: "visit",
        specialty: "Orthopedics",
        timeframe: "1–2 weeks",
        reason: "Fracture healing assessment, cast or splint check",
        priority: "high",
      },
      {
        type: "imaging",
        study: "X-ray",
        timeframe: "4–6 weeks",
        reason: "Confirm fracture alignment and healing progress",
        priority: "routine",
      },
    ],
  },

  // ── Asthma ───────────────────────────────────────────────────────────────
  "195967001": {
    items: [
      {
        type: "visit",
        specialty: "Primary Care or Pulmonology",
        timeframe: "1–2 weeks",
        reason: "Asthma control assessment, inhaler technique, action plan review",
        priority: "high",
      },
      {
        type: "monitoring",
        timeframe: "Daily — 2 weeks",
        reason: "Symptom diary and peak flow monitoring if meter provided",
        priority: "routine",
      },
    ],
  },

  // ── Urinary tract infection ───────────────────────────────────────────────
  "68566005": {
    items: [
      {
        type: "visit",
        specialty: "Primary Care",
        timeframe: "1–2 weeks",
        reason: "Confirm resolution of UTI, repeat urine culture if symptoms persist",
        priority: "routine",
      },
      {
        type: "lab",
        tests: ["Urinalysis", "Urine culture"],
        timeframe: "1 week after completing antibiotics",
        reason: "Test of cure if recurrent UTI or pyelonephritis",
        priority: "routine",
      },
    ],
  },

  // ── Cellulitis ───────────────────────────────────────────────────────────
  "128045006": {
    items: [
      {
        type: "visit",
        specialty: "Primary Care",
        timeframe: "48–72 hours",
        reason: "Wound check — cellulitis must be improving within 48 hours of antibiotics",
        priority: "high",
      },
      {
        type: "visit",
        specialty: "Primary Care",
        timeframe: "1 week",
        reason: "Confirm resolution and complete antibiotic course",
        priority: "routine",
      },
    ],
  },

  // ── Pulmonary embolism ────────────────────────────────────────────────────
  "59282003": {
    items: [
      {
        type: "visit",
        specialty: "Hematology or Pulmonology",
        timeframe: "1–2 weeks",
        reason: "Anticoagulation management, clot burden follow-up",
        priority: "high",
      },
      {
        type: "lab",
        tests: ["INR", "CBC"],
        timeframe: "3–5 days",
        reason: "Anticoagulation monitoring",
        priority: "high",
      },
    ],
  },

  // ── Deep vein thrombosis ──────────────────────────────────────────────────
  "128053003": {
    items: [
      {
        type: "visit",
        specialty: "Primary Care or Vascular Surgery",
        timeframe: "1 week",
        reason: "Anticoagulation management and DVT progression check",
        priority: "high",
      },
      {
        type: "lab",
        tests: ["INR", "CBC"],
        timeframe: "3–5 days",
        reason: "Anticoagulation level monitoring",
        priority: "high",
      },
    ],
  },

  // ── Default (any unrecognized condition) ─────────────────────────────────
  "default": {
    items: [
      {
        type: "visit",
        specialty: "Primary Care",
        timeframe: "7–14 days",
        reason: "Post-discharge follow-up to review recovery progress",
        priority: "high",
      },
    ],
  },
};

// ── Procedure-based follow-up rules (keyed by SNOMED code) ─────────────────
// These layer on top of condition rules — apply when relevant procedure is found.

export const PROCEDURE_FOLLOW_UP_RULES: Record<string, FollowUpRule> = {

  // ── Any surgical procedure ────────────────────────────────────────────────
  "387713003": {
    items: [
      {
        type: "visit",
        specialty: "Surgery",
        timeframe: "2–4 weeks",
        reason: "Post-operative wound check and surgical follow-up",
        priority: "high",
      },
      {
        type: "visit",
        specialty: "Primary Care",
        timeframe: "10–14 days",
        reason: "Wound assessment and medication review",
        priority: "high",
      },
    ],
  },

  // ── Cardiac catheterization ───────────────────────────────────────────────
  "41339005": {
    items: [
      {
        type: "visit",
        specialty: "Cardiology",
        timeframe: "1–2 weeks",
        reason: "Post-cath follow-up, access site healing check",
        priority: "high",
      },
    ],
  },

  // ── Colonoscopy / endoscopy ───────────────────────────────────────────────
  "73761001": {
    items: [
      {
        type: "visit",
        specialty: "Gastroenterology",
        timeframe: "2–4 weeks",
        reason: "Biopsy results review and procedure follow-up",
        priority: "routine",
      },
    ],
  },

  // ── Chest X-ray (imaging — no action needed beyond reading) ──────────────
  "399208008": {
    items: [], // Chest X-ray during admission doesn't require separate follow-up procedure
  },

  // ── IV antibiotic therapy (document completion, no separate follow-up needed) ─
  "372687004": {
    items: [], // Completion of IV antibiotics during inpatient stay — handled by condition rules
  },
};
