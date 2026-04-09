# DischargePlus MCP Server (TypeScript)

FHIR-powered MCP tools for discharge workflows.

## Project structure

```
src/
├── index.ts                  # Entry point
├── server.ts                 # Express + MCP server setup
├── config.ts                 # Zod-validated environment config
├── logger.ts                 # Structured JSON logger
├── fhir/                     # FHIR client and query layer
│   ├── client.ts             # Axios-based FHIR HTTP client
│   ├── context.ts            # FhirContext extraction from headers
│   ├── constants.ts          # Header name constants
│   └── queries.ts            # Reusable FHIR query functions
├── mcp/                      # MCP abstractions
│   ├── tool.interface.ts     # IMcpTool interface
│   └── response.ts           # Response helpers (text, error, json)
├── tools/                    # MCP tool implementations
│   ├── patient-age/          # GetPatientAge
│   ├── patient-id/           # FindPatientId
│   ├── reconcile-medications/# ReconcileMedications
│   ├── discharge-instructions/ # GenerateDischargeInstructions
│   ├── readmission-risk/     # AssessReadmissionRisk
│   ├── follow-up-plan/       # PlanFollowUp
│   ├── audit-med-costs/      # AuditMedCosts
│   └── discharge-packet/     # BuildDischargePacket (orchestrator)
├── data/                     # Static lookup tables
│   ├── charlson-mapping.ts   # Charlson Comorbidity Index
│   ├── cost-tiers.ts         # Brand/generic medication data
│   ├── follow-up-rules.ts    # Follow-up recommendation rules
│   ├── med-instructions.ts   # Medication instruction templates
│   └── warning-signs.ts      # Condition warning signs
├── external/                 # Third-party API clients
│   └── rxnav/                # RxNav (free, no key)
└── utils/                    # Shared utilities
    ├── null.ts               # Null assertion helper
    └── patient-context.ts    # Patient ID resolution
```

## Each tool follows this pattern

```
tools/<tool-name>/
├── types.ts     # Input/output type definitions
├── service.ts   # Pure business logic (no HTTP, no MCP)
└── index.ts     # MCP tool registration + FHIR fetching
```

The service layer takes pre-fetched FHIR resources and returns typed results.
This separation lets `BuildDischargePacket` call all services with shared data
from a single `Promise.all()` fetch — no redundant FHIR requests.

## Getting started

```bash
npm install
```

### Development (with hot reload)

```bash
npm run dev
```

### Production build

```bash
npm run build
npm start
```

## Available scripts

| Script          | Description                              |
| --------------- | ---------------------------------------- |
| `npm run dev`   | Start with tsx watch (hot reload)        |
| `npm start`     | Run compiled JS from dist/               |
| `npm run build` | Compile TypeScript to dist/              |
| `npm run typecheck` | Type-check without emitting          |
| `npm run lint`  | Run ESLint on src/                       |
| `npm run lint:fix` | Auto-fix lint issues                  |
| `npm run format` | Format with Prettier                    |
| `npm run format:check` | Check formatting                  |

## Environment variables

See `.env.example`. Validated at startup with Zod — the server fails fast on
misconfiguration.

| Variable       | Default   | Description                          |
| -------------- | --------- | ------------------------------------ |
| `PO_ENV`       | `local`   | `local`, `dev`, or `prod`            |
| `PORT`         | `5000`    | Server port                          |
| `ALLOWED_HOST` | —         | Additional allowed host (local only) |
| `LOG_LEVEL`    | `info`    | `debug`, `info`, `warn`, `error`     |

## Debugging with VS Code

1. Open this folder (`typescript/`) as your workspace root.
2. Open `Run and Debug` (Ctrl+Shift+D / Cmd+Shift+D).
3. Select `Dev Server` and press play.
