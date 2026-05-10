export const metadata = { title: "Architecture" };

export default function ArchitecturePage() {
  return (
    <>
      <div className="text-xs uppercase tracking-[0.2em] text-accent-400 mb-3">
        Overview
      </div>
      <h1>Architecture</h1>
      <p>
        DischargePlus is a single Node.js process. It exposes one HTTP endpoint
        (<code>POST /mcp</code>) that speaks the Model Context Protocol over
        streamable HTTP, plus a <code>GET /health</code> for liveness probes.
      </p>

      <h2>High-level flow</h2>
      <pre>{`┌──────────────────────────┐
│   MCP client (LLM app)   │        Prompt Opinion, Claude Desktop, Cursor, …
└─────────────┬────────────┘
              │  POST /mcp
              │  x-fhir-server-url
              │  x-fhir-access-token
              │  x-patient-id
              ▼
┌──────────────────────────┐
│  Express + MCP server    │        server.ts
│  createMcpExpressApp(…)  │
└─────────────┬────────────┘
              │  registerTool(...) for every tool
              ▼
┌──────────────────────────┐       ┌──────────────────────┐
│       Tool handler       │──────▶│      FHIR client     │
│ src/tools/<tool>/index   │       │  src/fhir/client.ts  │
│        ↓ pure            │       └──────────┬───────────┘
│   src/tools/<tool>/      │                  │  Axios + bearer
│       service.ts         │                  ▼
└──────────────────────────┘       ┌──────────────────────┐
                                   │    FHIR R4 server    │
                                   └──────────────────────┘`}</pre>

      <h2>Source layout</h2>
      <pre>{`typescript/
├── Dockerfile
├── src/
│   ├── index.ts              # entry point — boots the server
│   ├── server.ts             # Express + MCP wiring, tool registration
│   ├── config.ts             # Zod-validated env (fails fast)
│   ├── logger.ts             # JSON structured logs
│   ├── fhir/
│   │   ├── client.ts         # Axios FHIR HTTP client
│   │   ├── context.ts        # FhirContext from request headers
│   │   ├── constants.ts      # Header names
│   │   └── queries.ts        # Typed, reusable FHIR search helpers
│   ├── mcp/
│   │   ├── tool.interface.ts # IMcpTool contract
│   │   └── response.ts       # text / error / json helpers
│   ├── tools/                # One folder per MCP tool
│   │   ├── patient-age/
│   │   ├── patient-id/
│   │   ├── list-encounters/
│   │   ├── reconcile-medications/
│   │   ├── discharge-instructions/
│   │   ├── readmission-risk/
│   │   ├── follow-up-plan/
│   │   ├── audit-med-costs/
│   │   └── discharge-packet/ # Orchestrator
│   ├── data/                 # Static tables: Charlson, cost tiers, …
│   ├── external/rxnav/       # Free RxNav API client (no key)
│   └── utils/                # Small helpers
└── package.json`}</pre>

      <h2>Tool anatomy</h2>
      <p>
        Every tool follows the same three-file shape. This keeps the MCP layer
        thin and the business logic easy to test and to share between tools.
      </p>
      <pre>{`tools/<tool-name>/
├── types.ts     # Input/output type definitions
├── service.ts   # Pure logic — takes pre-fetched FHIR, returns a typed result
└── index.ts     # MCP registration, FHIR fetching, patient-id resolution`}</pre>
      <p>
        The service layer never knows about HTTP or MCP. That is what lets the{" "}
        <code>BuildDischargePacket</code> orchestrator fetch FHIR once and feed
        the same resources into every sub-service via a single{" "}
        <code>Promise.all</code>.
      </p>

      <h2>Key pieces</h2>
      <h3>Server bootstrap</h3>
      <p>
        <code>src/server.ts</code> uses{" "}
        <code>createMcpExpressApp</code> from the official MCP SDK, wires CORS,
        a health endpoint, and registers every tool imported from{" "}
        <code>src/tools/index.ts</code>. Each request creates a fresh{" "}
        <code>McpServer</code> and <code>StreamableHTTPServerTransport</code>{" "}
        so there is no cross-request state.
      </p>

      <h3>FHIR client</h3>
      <p>
        <code>fhirClient</code> is a thin Axios wrapper that reads the{" "}
        <code>x-fhir-server-url</code> and <code>x-fhir-access-token</code>{" "}
        headers from the incoming request. Nothing is cached, and every MCP
        request gets its own client instance.
      </p>

      <h3>Patient context</h3>
      <p>
        Every clinical tool accepts an optional <code>patientId</code> in its
        input schema. If it is not supplied, the shared{" "}
        <code>resolvePatientId</code> helper pulls the id from the{" "}
        <code>x-patient-id</code> header. That way, clients that already know
        the patient (like Prompt Opinion&apos;s FHIR context extension) don’t
        have to thread the id through every call.
      </p>

      <h3>Configuration</h3>
      <p>
        <code>src/config.ts</code> validates all environment variables with Zod
        at startup and fails the process immediately on misconfiguration. See{" "}
        <a href="/wiki/getting-started">Getting started</a> for the exact
        variables.
      </p>
    </>
  );
}
