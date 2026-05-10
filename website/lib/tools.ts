export interface ToolField {
  name: string;
  type: string;
  required?: boolean;
  description: string;
}

export interface ToolDoc {
  slug: string;
  name: string;
  category: "Identity" | "Clinical" | "Planning" | "Financial" | "Orchestrator";
  summary: string;
  description: string;
  orchestrator?: boolean;
  fhirResources: string[];
  inputs: ToolField[];
  output: {
    shape: string;
    notes?: string[];
  };
  example?: string;
}

export const TOOLS: ToolDoc[] = [
  {
    slug: "find-patient-id",
    name: "FindPatientId",
    category: "Identity",
    summary:
      "Look up a FHIR Patient resource by given and/or family name and return the patient id.",
    description:
      "Performs a FHIR `Patient` search using the name arguments as `given` and `family`. " +
      "If no results are found, the order is swapped and retried, since LLMs sometimes reverse the order. " +
      "Returns an error if zero or more than one patient matches.",
    fhirResources: ["Patient"],
    inputs: [
      {
        name: "firstName",
        type: "string",
        required: true,
        description: "The patient's given name.",
      },
      {
        name: "lastName",
        type: "string",
        required: false,
        description: "The patient's family name (optional).",
      },
    ],
    output: {
      shape: `"<patient-id>"`,
      notes: [
        "Text response containing the matched patient id.",
        "Returns an error string when zero or multiple patients match.",
      ],
    },
  },
  {
    slug: "get-patient-age",
    name: "GetPatientAge",
    category: "Identity",
    summary:
      "Compute the patient's age in whole years from their FHIR birthDate.",
    description:
      "Reads the `Patient` resource and derives age using `differenceInYears` from `date-fns`. " +
      "The patientId can be supplied in the input schema or via the `x-patient-id` context header.",
    fhirResources: ["Patient"],
    inputs: [
      {
        name: "patientId",
        type: "string",
        required: false,
        description:
          "Optional when a patient context header is already set on the request.",
      },
    ],
    output: {
      shape: `"The patient's age is: <N>"`,
      notes: ["Returns a text response, not JSON."],
    },
  },
  {
    slug: "list-encounters",
    name: "ListEncounters",
    category: "Identity",
    summary:
      "List all encounters for a patient, grouped by encounter class (Inpatient, ER, Ambulatory, …).",
    description:
      "Queries FHIR `Encounter` for the patient, optionally filtered by class code. " +
      "Returns a structured response sorted by date, grouped by human-readable class labels.",
    fhirResources: ["Encounter"],
    inputs: [
      {
        name: "patientId",
        type: "string",
        required: false,
        description: "Optional when patient context is present in headers.",
      },
      {
        name: "classFilter",
        type: "'IMP' | 'AMB' | 'EMER' | 'SS' | 'HH' | 'VR' | 'OBSENC'",
        required: false,
        description:
          "Optional encounter class code. Unrecognised codes return an error.",
      },
    ],
    output: {
      shape: `{
  patientId: string;
  totalEncounters: number;
  byClass: {
    [label: string]: Array<{
      id: string;
      status: string;
      class: string;
      classLabel: string;
      start: string | null;
      end: string | null;
    }>;
  };
}`,
    },
  },
  {
    slug: "reconcile-medications",
    name: "ReconcileMedications",
    category: "Clinical",
    summary:
      "Compare pre-admission and discharge medications; flag new, stopped, changed, and continued items.",
    description:
      "Splits `MedicationRequest` resources by `authoredOn` relative to the encounter start to identify " +
      "pre-admission vs. discharge lists, matches by RxNorm code, diffs dosages, and flags drug-drug " +
      "interactions plus allergy conflicts. (Logic stubbed pending implementation.)",
    fhirResources: ["Encounter", "MedicationRequest", "AllergyIntolerance"],
    inputs: [
      {
        name: "patientId",
        type: "string",
        required: false,
        description: "Optional when patient context is present in headers.",
      },
    ],
    output: {
      shape: `{
  reconciliation: {
    new: MedicationChange[];
    stopped: MedicationChange[];
    changed: MedicationChange[];
    continued: MedicationChange[];
  };
  interactionWarnings: string[];
  allergyConflicts: string[];
}

MedicationChange = {
  medication: string;
  rxNormCode?: string;
  previousDosage?: string;
  currentDosage?: string;
}`,
    },
  },
  {
    slug: "generate-discharge-instructions",
    name: "GenerateDischargeInstructions",
    category: "Clinical",
    summary:
      "Produce structured, reading-level-appropriate discharge instructions for the patient.",
    description:
      "Builds a visit summary, per-medication instructions, warning signs, activity restrictions, " +
      "and diet guidance from conditions, procedures, and medication requests tied to the latest inpatient encounter. " +
      "A `readingLevel` input toggles between `simple`, `standard`, and `detailed` templates.",
    fhirResources: [
      "Patient",
      "Encounter",
      "Condition",
      "Procedure",
      "MedicationRequest",
    ],
    inputs: [
      {
        name: "patientId",
        type: "string",
        required: false,
        description: "Optional when patient context is present in headers.",
      },
      {
        name: "readingLevel",
        type: "'simple' | 'standard' | 'detailed'",
        required: false,
        description: "Defaults to 'standard'.",
      },
    ],
    output: {
      shape: `{
  visitSummary: string;
  medications: Array<{
    name: string;
    dosage: string;
    frequency: string;
    instructions: string;
    warnings?: string[];
  }>;
  warningSigns: string[];
  activityRestrictions: string[];
  dietGuidance: string;
}`,
    },
  },
  {
    slug: "assess-readmission-risk",
    name: "AssessReadmissionRisk",
    category: "Clinical",
    summary:
      "Compute a LACE readmission risk score and category from the most recent inpatient encounter.",
    description:
      "Implements the LACE index — Length of stay, Acuity of admission, Charlson Comorbidity, " +
      "ER visits in the prior 6 months — using SNOMED codes mapped to Charlson categories. " +
      "Scores 0–4 are low, 5–9 moderate, 10+ high, each with a recommended transitional care action.",
    fhirResources: ["Encounter", "Condition"],
    inputs: [
      {
        name: "patientId",
        type: "string",
        required: false,
        description: "Optional when patient context is present in headers.",
      },
    ],
    output: {
      shape: `{
  laceScore: number;
  category: "low" | "moderate" | "high";
  breakdown: { L: number; A: number; C: number; E: number };
  recommendation: string;
}`,
      notes: [
        "Length of stay is derived from `encounter.period.start`/`end`.",
        "ER count is capped at 4 to follow the LACE definition.",
      ],
    },
  },
  {
    slug: "plan-follow-up",
    name: "PlanFollowUp",
    category: "Planning",
    summary:
      "Generate a prioritized follow-up plan: PCP, specialist visits, imaging, labs.",
    description:
      "Walks the patient's conditions, procedures, observations, and existing care plans, " +
      "applies a rules table (`follow-up-rules.ts`), and returns a list of follow-up items " +
      "with type, specialty, timeframe, and priority.",
    fhirResources: ["Condition", "Procedure", "Observation", "CarePlan"],
    inputs: [
      {
        name: "patientId",
        type: "string",
        required: false,
        description: "Optional when patient context is present in headers.",
      },
    ],
    output: {
      shape: `{
  followUpItems: Array<{
    type: string;
    specialty?: string;
    timeframe: string;
    reason: string;
    priority: "routine" | "high" | "urgent" | "emergent";
    study?: string;
    tests?: string[];
  }>;
  readmissionRiskNote: string;
}`,
    },
  },
  {
    slug: "audit-med-costs",
    name: "AuditMedCosts",
    category: "Financial",
    summary:
      "Suggest generic or lower-cost alternatives to discharge medications using RxNav.",
    description:
      "For every `MedicationRequest` with an RxNorm code, checks a curated brand→generic table and falls back to " +
      "the free RxNav `related` API to find therapeutic alternatives. Filters out anything that conflicts with the " +
      "patient's allergies and reports an estimated monthly savings.",
    fhirResources: ["MedicationRequest", "AllergyIntolerance"],
    inputs: [
      {
        name: "patientId",
        type: "string",
        required: false,
        description: "Optional when patient context is present in headers.",
      },
    ],
    output: {
      shape: `{
  savingsOpportunities: Array<{
    currentMedication: string;
    suggestedAlternative: string;
    estimatedMonthlySavings: number;
    reason: string;
  }>;
  totalEstimatedMonthlySavings: number;
  noChangeNeeded: string[];
  unanalyzed: string[];
  disclaimer: string;
}`,
      notes: [
        "Uses the free, keyless RxNav API — no configuration required.",
      ],
    },
  },
  {
    slug: "build-discharge-packet",
    name: "BuildDischargePacket",
    category: "Orchestrator",
    orchestrator: true,
    summary:
      "Master orchestrator: runs every sub-tool in parallel from one FHIR fetch and returns a unified packet.",
    description:
      "Calls `fetchDischargeFhirData` once to pull every resource the sub-tools need, then runs them " +
      "concurrently with `Promise.all`. Each sub-tool is wrapped in a safe runner, so a single failure " +
      "turns into `{ error: string }` on that field instead of blowing up the whole packet.",
    fhirResources: [
      "Patient",
      "Encounter",
      "Condition",
      "Procedure",
      "MedicationRequest",
      "AllergyIntolerance",
      "Observation",
      "CarePlan",
    ],
    inputs: [
      {
        name: "patientId",
        type: "string",
        required: false,
        description: "Optional when patient context is present in headers.",
      },
      {
        name: "readingLevel",
        type: "'simple' | 'standard' | 'detailed'",
        required: false,
        description:
          "Forwarded to GenerateDischargeInstructions. Defaults to 'standard'.",
      },
    ],
    output: {
      shape: `{
  patient: fhir.Patient;
  encounter: fhir.Encounter;
  medicationReconciliation: ReconcileMedicationsResult | { error: string };
  dischargeInstructions:    DischargeInstructionsResult  | { error: string };
  readmissionRisk:          ReadmissionRiskResult        | { error: string };
  followUpPlan:             FollowUpPlanResult           | { error: string };
  costSavings:              AuditMedCostsResult          | { error: string };
  generatedAt: string;  // ISO 8601
  disclaimer: string;
}`,
      notes: [
        "Failures on one sub-tool never abort the whole packet.",
        "Uses a single Promise.all FHIR fetch — no duplicate requests across sub-tools.",
      ],
    },
  },
];

export const TOOL_BY_SLUG: Record<string, ToolDoc> = Object.fromEntries(
  TOOLS.map((t) => [t.slug, t]),
);
