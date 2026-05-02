# Discharge+ — FHIR-Powered MCP Tools for Discharge Workflows

> **Agents Assemble Hackathon Submission** · Prompt Opinion Marketplace · May 2026

## Project Summary

Discharge+ is an MCP server that gives any AI agent six composable tools to automate the clinical discharge process—generating patient instructions, reconciling medications, scoring readmission risk, planning follow-ups, auditing medication costs, and assembling everything into a single structured discharge packet. It is built for clinicians and discharge coordinators who need reliable, standards-compliant outputs from any FHIR R4 EHR without writing bespoke integration code. By exposing deterministic, rule-based logic through the Model Context Protocol, Discharge+ turns a 30-minute paperwork burden into a single agent call.

---

## The Problem

Discharge documentation is one of the highest-risk, highest-effort tasks in acute care. A clinician must simultaneously reconcile a patient's complete medication list, produce plain-language patient instructions calibrated to reading level, schedule follow-up appointments across multiple specialties, flag drug interactions and allergy conflicts, compute readmission risk, and identify generic-substitution cost savings—all before the patient leaves the unit. Studies consistently put the manual effort at 20–40 minutes per patient, and errors made at this stage (missed interaction warnings, wrong dose instructions, skipped follow-ups) are a leading driver of preventable 30-day readmissions. Discharge+ eliminates the manual assembly work by pulling structured FHIR data and running each step through tested, deterministic rules, so the clinician reviews and approves rather than authors from scratch.

---

## Tools

All six tools accept an optional `patientId` parameter. If omitted, the patient identity is resolved automatically from the SHARP context headers (see [SHARP Compliance](#sharp-compliance)).

### 1. `GenerateDischargeInstructions`

Produces plain-language discharge instructions from the patient's active conditions, procedures, and medications.

| | |
|---|---|
| **Inputs** | `patientId?`, `readingLevel` (`simple` \| `standard` \| `detailed`) |
| **Output** | Dual-packet JSON with a `clinician` section (visit summary, diagnoses, procedures, LOS, medications) and a `patient` section (plain-language summary, medication list, warning signs, activity restrictions, diet guidance) |

### 2. `ReconcileMedications`

Compares pre-admission medications against active discharge medications and checks for drug interactions and allergy conflicts.

| | |
|---|---|
| **Inputs** | `patientId?` |
| **Output** | Reconciliation object with `new`, `stopped`, `changed`, and `continued` medication lists; `interactions` array (via RxNav); `allergyConflicts` array |

### 3. `AssessReadmissionRisk`

Computes the LACE readmission risk index (score 0–19) from encounter and comorbidity data using purely deterministic arithmetic.

| | |
|---|---|
| **Inputs** | `patientId?` |
| **Output** | `{ score, risk, recommendation, breakdown: { L, A, C, E } }` |

### 4. `PlanFollowUp`

Recommends follow-up visits, labs, and imaging based on the patient's active conditions, recent procedures, lab observations, and existing care plans.

| | |
|---|---|
| **Inputs** | `patientId?` |
| **Output** | `followUpItems[]` — each item has `type`, `specialty`, `timeframe`, `reason`, and (for labs) a `tests[]` list |

### 5. `AuditMedCosts`

Identifies brand-to-generic substitution opportunities for active medications, filtered against the patient's allergy list.

| | |
|---|---|
| **Inputs** | `patientId?` |
| **Output** | `opportunities[]` — each with `brandName`, `genericName`, `estimatedMonthlySavings`; plus `totalEstimatedMonthlySavings` |

### 6. `BuildDischargePacket`

Master orchestrator. Calls all five tools above in parallel and assembles the results into a single structured JSON discharge packet with two top-level sections: a **Clinician Packet** (clinical summary, med reconciliation, LACE score, follow-up plan, cost savings) and a **Patient Packet** (plain-language instructions, annotated medication list, warning signs, follow-up appointments).

| | |
|---|---|
| **Inputs** | `patientId?`, `readingLevel` (`simple` \| `standard` \| `detailed`) |
| **Output** | `{ clinicianPacket, patientPacket, generatedAt, disclaimer }` |

For full field-level schemas, see the [SHARP-on-MCP Specification](https://www.sharponmcp.com/).

---

## Architecture

```
typescript/src/
├── config.ts                  # Env var validation (zod)
├── index.ts                   # Entry point
├── server.ts                  # Express + MCP server bootstrap
├── logger.ts                  # Structured logger
│
├── fhir/
│   ├── client.ts              # Axios FHIR client (Bearer token injection)
│   ├── constants.ts           # SHARP header names, code systems
│   ├── context.ts             # FHIR context extraction from request
│   ├── queries.ts             # Typed FHIR query helpers
│   └── index.ts
│
├── mcp/
│   ├── tool.interface.ts      # IMcpTool contract
│   ├── response.ts            # McpResponse helpers (json / error)
│   └── index.ts
│
├── tools/
│   ├── discharge-instructions/  # GenerateDischargeInstructions
│   ├── reconcile-medications/   # ReconcileMedications
│   ├── readmission-risk/        # AssessReadmissionRisk
│   ├── follow-up-plan/          # PlanFollowUp
│   ├── audit-med-costs/         # AuditMedCosts
│   └── discharge-packet/        # BuildDischargePacket (orchestrator)
│
├── data/                      # Static clinical rule tables
│   ├── charlson-mapping.ts    # Comorbidity → LACE C-score
│   ├── drug-interactions.ts   # Known interaction pairs
│   ├── follow-up-rules.ts     # Condition/procedure → follow-up rules
│   ├── cost-tiers.ts          # Brand/generic cost data
│   └── …
│
├── external/
│   └── rxnav/                 # RxNav drug-interaction API client
│
└── utils/
    ├── patient-context.ts     # SHARP patient-ID resolution
    ├── expand-abbreviations.ts
    └── null.ts                # getOrThrow helper
```

### `runSafe()` Fault-Tolerance Pattern

`BuildDischargePacket` calls all five sub-tools in parallel via `Promise.all`. Each call is wrapped in `runSafe()`, a thin helper that catches any thrown error and returns `{ error: string }` instead of propagating it. This means a failure in, say, the RxNav drug-interaction lookup will never crash the entire packet—the clinician packet will include `{ error: "…" }` for that section while all other sections render normally. The consuming agent (or rendering prompt) can surface a warning for the failed section without losing the rest of the discharge output.

---

## SHARP Compliance

Discharge+ reads three SHARP extension headers on every inbound MCP request:

| Header | Purpose |
|---|---|
| `x-fhir-server-url` | Base URL of the patient's FHIR R4 server. All FHIR queries are scoped to this endpoint. |
| `x-fhir-access-token` | Bearer token forwarded to the FHIR server. The token is also decoded (without verification) to extract the `patient` JWT claim for automatic patient-ID resolution. |
| `x-patient-id` | Explicit patient ID fallback. Used when the access token does not embed a `patient` claim. |

Any tool call that omits the `patientId` parameter will automatically resolve the patient identity from these headers, enabling zero-friction invocation from within a Prompt Opinion workspace that has an active EHR session.

---

## How to Run

### Prerequisites

- Node.js ≥ 20
- A reachable FHIR R4 server (e.g. [HAPI FHIR](https://hapi.fhir.org/), [Smile CDR](https://smilecdr.com/), or Epic/Cerner sandbox)

### Install

```bash
cd typescript
npm install
```

### Configure

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

```env
PO_ENV=local          # local | dev | prod
PORT=5000             # HTTP port the MCP server listens on
ALLOWED_HOST=         # Optional extra allowed host (e.g. your ngrok domain)
LOG_LEVEL=info        # debug | info | warn | error
```

### Start (development)

```bash
npm run dev
```

The server starts at `http://localhost:5000`. The MCP endpoint is available at `http://localhost:5000/mcp`.

### Start (production build)

```bash
npm run build
npm start
```

### Call a Tool

Send a POST request to the MCP endpoint with the SHARP headers and a tool invocation:

```bash
curl -X POST http://localhost:5000/mcp \
  -H "Content-Type: application/json" \
  -H "x-fhir-server-url: https://your-fhir-server/fhir" \
  -H "x-fhir-access-token: <bearer-token>" \
  -H "x-patient-id: patient-123" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "BuildDischargePacket",
      "arguments": { "readingLevel": "standard" }
    }
  }'
```

---

## Test Results

End-to-end tests were run against a HAPI FHIR R4 sandbox with a synthetic patient population.

| Tool | Status | Notes |
|---|---|---|
| `GenerateDischargeInstructions` | ✅ Pass | All three reading levels (`simple`, `standard`, `detailed`) return valid dual-packet JSON |
| `ReconcileMedications` | ✅ Pass | New/stopped/changed/continued classification correct; interaction and allergy checks return expected flags |
| `AssessReadmissionRisk` | ✅ Pass | LACE score arithmetic verified deterministically across low/moderate/high risk scenarios |
| `PlanFollowUp` | ✅ Pass | Condition- and procedure-driven rules fire correctly; lab and imaging items include correct `tests[]` / `study` fields |
| `AuditMedCosts` | ✅ Pass | Brand-to-generic opportunities returned with correct savings estimates; allergy-conflicted generics excluded |
| `BuildDischargePacket` | ✅ Pass | All sub-tools invoked in parallel; `runSafe()` fault isolation verified (individual sub-tool failure does not crash packet) |

---

## Demo

> 📹 Demo video coming soon — will be embedded here once recorded.

---

## Resources

- [SHARP-on-MCP Specification](https://www.sharponmcp.com/)
- [Prompt Opinion Platform](https://promptopinion.ai)
- [Agents Assemble Hackathon](https://promptopinion.ai)
- [MCP SDK](https://github.com/modelcontextprotocol/typescript-sdk)
