import Link from "next/link";
import { TOOLS } from "@/lib/tools";

export default function HomePage() {
  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(ellipse_at_top,rgba(20,184,166,0.18),transparent_60%)]" />
      <section className="relative mx-auto max-w-7xl px-6 pt-20 pb-20">
        <div className="flex justify-center mb-8">
          <a
            href="https://www.sharponmcp.com/"
            target="_blank"
            rel="noreferrer"
            className="group inline-flex items-center gap-2 rounded-full border border-ink-700 bg-ink-900/60 px-3 py-1 text-xs text-ink-300 hover:border-accent-500"
          >
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent-400" />
            Implements the SHARP-on-MCP specification
            <span className="text-ink-500 group-hover:text-accent-400">→</span>
          </a>
        </div>
        <h1 className="max-w-4xl mx-auto text-center text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-ink-50 leading-[1.05]">
          FHIR-powered MCP tools
          <br />
          for hospital{" "}
          <span className="bg-gradient-to-r from-accent-400 to-teal-300 bg-clip-text text-transparent">
            discharge workflows
          </span>
        </h1>
        <p className="max-w-2xl mx-auto text-center text-ink-300 mt-6 text-lg leading-relaxed">
          DischargePlus is an open-source community MCP server that plugs into{" "}
          <a
            href="https://promptopinion.ai"
            target="_blank"
            rel="noreferrer"
            className="text-accent-400 underline underline-offset-4 decoration-accent-400/40"
          >
            Prompt Opinion
          </a>{" "}
          and any FHIR R4 server to produce deterministic, explainable discharge
          artifacts — from medication reconciliation to LACE readmission risk.
        </p>
        <div className="mt-10 flex items-center justify-center gap-3">
          <Link
            href="/wiki"
            className="inline-flex items-center gap-2 rounded-md bg-accent-500 hover:bg-accent-400 text-ink-950 font-semibold px-5 py-2.5"
          >
            Open the wiki
            <span>→</span>
          </Link>
          <Link
            href="/wiki/getting-started"
            className="inline-flex items-center gap-2 rounded-md border border-ink-700 hover:border-accent-500 text-ink-100 hover:text-accent-400 px-5 py-2.5"
          >
            Quick start
          </Link>
        </div>
      </section>

      <section className="relative mx-auto max-w-7xl px-6 pb-24">
        <div className="rounded-2xl border border-ink-800 bg-ink-900/50 p-6 md:p-8 shadow-[0_0_80px_-30px_rgba(20,184,166,0.25)]">
          <div className="grid gap-6 md:grid-cols-3">
            <Feature
              title="Stateless by design"
              body="Every MCP request carries its own FHIR server URL and access token via headers — no shared state, no stored credentials."
            />
            <Feature
              title="Deterministic logic"
              body="Pure services with typed inputs and outputs. No LLM calls inside tools. Easy to test, easy to audit."
            />
            <Feature
              title="Composable"
              body="Each sub-tool works standalone, and BuildDischargePacket orchestrates them in a single Promise.all — no duplicate FHIR fetches."
            />
          </div>
        </div>
      </section>

      <section className="relative mx-auto max-w-7xl px-6 pb-24">
        <div className="flex items-end justify-between mb-6">
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-accent-400 mb-2">
              Tools
            </div>
            <h2 className="text-2xl font-semibold tracking-tight text-ink-50">
              What you can do out of the box
            </h2>
          </div>
          <Link
            href="/wiki/tools"
            className="text-sm text-ink-300 hover:text-accent-400"
          >
            See all →
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TOOLS.map((tool) => (
            <Link
              key={tool.slug}
              href={`/wiki/tools/${tool.slug}`}
              className="group rounded-xl border border-ink-800 bg-ink-900/60 p-5 hover:border-accent-500/60 hover:bg-ink-900"
            >
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`inline-block h-1.5 w-1.5 rounded-full ${
                    tool.orchestrator ? "bg-accent-400" : "bg-ink-500"
                  }`}
                />
                <code className="text-sm font-mono text-ink-100 group-hover:text-accent-400">
                  {tool.name}
                </code>
              </div>
              <p className="text-sm text-ink-400 leading-6 mt-2">
                {tool.summary}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="relative mx-auto max-w-7xl px-6 pb-28">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-ink-800 bg-ink-900/50 p-6">
            <div className="text-xs uppercase tracking-[0.2em] text-accent-400 mb-3">
              Minimal request
            </div>
            <pre className="rounded-lg bg-ink-950 border border-ink-800 p-4 text-xs font-mono overflow-x-auto text-ink-100 leading-6">
{`POST /mcp
Content-Type: application/json
x-fhir-server-url: https://fhir.example.com/r4
x-fhir-access-token: <bearer token>
x-patient-id: 12345

{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "BuildDischargePacket",
    "arguments": { "readingLevel": "standard" }
  },
  "id": 1
}`}
            </pre>
          </div>
          <div className="rounded-2xl border border-ink-800 bg-ink-900/50 p-6">
            <div className="text-xs uppercase tracking-[0.2em] text-accent-400 mb-3">
              What comes back
            </div>
            <pre className="rounded-lg bg-ink-950 border border-ink-800 p-4 text-xs font-mono overflow-x-auto text-ink-100 leading-6">
{`{
  "patient": { ... },
  "encounter": { ... },
  "medicationReconciliation": { ... },
  "dischargeInstructions": { ... },
  "readmissionRisk": {
    "laceScore": 8,
    "category": "moderate",
    "breakdown": { "L": 3, "A": 0, "C": 3, "E": 2 }
  },
  "followUpPlan": { ... },
  "costSavings": { ... },
  "generatedAt": "2026-04-17T12:00:00.000Z",
  "disclaimer": "..."
}`}
            </pre>
          </div>
        </div>
      </section>
    </div>
  );
}

function Feature({ title, body }: { title: string; body: string }) {
  return (
    <div>
      <h3 className="text-ink-50 font-semibold mb-2">{title}</h3>
      <p className="text-sm text-ink-400 leading-6">{body}</p>
    </div>
  );
}
