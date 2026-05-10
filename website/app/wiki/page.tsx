import Link from "next/link";

export const metadata = { title: "Introduction" };

export default function WikiIndexPage() {
  return (
    <>
      <div className="text-xs uppercase tracking-[0.2em] text-accent-400 mb-3">
        Wiki
      </div>
      <h1>DischargePlus MCP — Introduction</h1>
      <p>
        <strong>DischargePlus</strong> is the open-source community MCP server
        that powers the discharge-workflow tools behind{" "}
        <a href="https://promptopinion.ai" target="_blank" rel="noreferrer">
          Prompt Opinion
        </a>
        . It is a stateless HTTP service that speaks the{" "}
        <a
          href="https://modelcontextprotocol.io/"
          target="_blank"
          rel="noreferrer"
        >
          Model Context Protocol
        </a>{" "}
        and fronts any FHIR R4 server that the caller is already authenticated
        against.
      </p>

      <h2>What problem does it solve?</h2>
      <p>
        Hospital discharge produces a dense bundle of artifacts — reconciled
        medication lists, patient-friendly instructions, follow-up plans,
        readmission-risk scores, and cost notes. Most of that work is
        deterministic over FHIR data: the right MCP tools can turn it into
        reliable, typed, testable functions that an LLM just calls.
      </p>
      <p>
        This server packages those tools once, so any MCP-aware client (Prompt
        Opinion, Claude Desktop, VS Code, Cursor, your own app) can use them
        against any FHIR server you bring.
      </p>

      <h2>Design principles</h2>
      <ul>
        <li>
          <strong>Stateless.</strong> The FHIR server URL and access token are
          passed on every request as headers. The MCP server never stores
          credentials or patient data.
        </li>
        <li>
          <strong>Deterministic.</strong> Every tool is a pure TypeScript
          service around typed FHIR inputs. No LLM calls hide inside the tools.
        </li>
        <li>
          <strong>Composable.</strong> Each sub-tool is callable on its own, and
          the{" "}
          <Link href="/wiki/tools/build-discharge-packet">
            BuildDischargePacket
          </Link>{" "}
          orchestrator runs them in parallel from one FHIR fetch.
        </li>
        <li>
          <strong>Open.</strong> ISC-licensed, easy to fork, and aligned with
          the{" "}
          <a
            href="https://www.sharponmcp.com/"
            target="_blank"
            rel="noreferrer"
          >
            SHARP-on-MCP specification
          </a>
          .
        </li>
      </ul>

      <h2>Where to go next</h2>
      <div className="not-prose grid gap-4 sm:grid-cols-2 mt-6">
        <NextCard
          href="/wiki/architecture"
          title="Architecture"
          body="How the server is wired together — transport, tool pattern, FHIR client."
        />
        <NextCard
          href="/wiki/getting-started"
          title="Getting started"
          body="Run the server locally with Node or Docker Compose."
        />
        <NextCard
          href="/wiki/tools"
          title="Tools"
          body="The nine tools exposed by the server, with inputs and output shapes."
        />
        <NextCard
          href="/wiki/deployment"
          title="Deploy on Sevalla"
          body="Ship the MCP server and this wiki to Sevalla from Docker."
        />
      </div>
    </>
  );
}

function NextCard({
  href,
  title,
  body,
}: {
  href: string;
  title: string;
  body: string;
}) {
  return (
    <Link
      href={href}
      className="group block rounded-xl border border-ink-800 bg-ink-900/60 p-5 hover:border-accent-500/60"
    >
      <div className="text-ink-50 font-semibold mb-1 group-hover:text-accent-400">
        {title} →
      </div>
      <p className="text-sm text-ink-400 leading-6">{body}</p>
    </Link>
  );
}
