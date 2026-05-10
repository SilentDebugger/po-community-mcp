export const metadata = { title: "Contributing" };

export default function ContributingPage() {
  return (
    <>
      <div className="text-xs uppercase tracking-[0.2em] text-accent-400 mb-3">
        Operations
      </div>
      <h1>Contributing</h1>
      <p>
        This is an open-source community server. New FHIR-backed tools, bug
        fixes, and doc improvements are very welcome — especially if they
        align with the{" "}
        <a href="https://www.sharponmcp.com/" target="_blank" rel="noreferrer">
          SHARP-on-MCP specification
        </a>
        .
      </p>

      <h2>Adding a new tool</h2>
      <ol>
        <li>
          Create a folder under <code>typescript/src/tools/&lt;kebab-name&gt;/</code>.
        </li>
        <li>
          Add three files:
          <pre>{`tools/<kebab-name>/
├── types.ts     # Input + output types
├── service.ts   # Pure logic — no HTTP, no MCP
└── index.ts     # Registers the MCP tool, fetches FHIR, calls the service`}</pre>
        </li>
        <li>
          Implement <code>IMcpTool</code> in <code>index.ts</code> and export
          an instance.
        </li>
        <li>
          Re-export the tool from <code>typescript/src/tools/index.ts</code> —
          the server auto-registers everything listed there.
        </li>
        <li>
          If the orchestrator should call it too, extend{" "}
          <code>fetchDischargeFhirData</code> with any new FHIR resources and
          add the sub-call to <code>buildDischargePacket</code>.
        </li>
        <li>
          Update the tool list in <code>website/lib/tools.ts</code> so it shows
          up in this wiki.
        </li>
      </ol>

      <h2>Coding standards</h2>
      <ul>
        <li>
          <strong>TypeScript strict mode</strong> is on — no <code>any</code>{" "}
          in tool code.
        </li>
        <li>
          <strong>Pure services.</strong> <code>service.ts</code> must not
          import Express, MCP SDK types, or the FHIR client. The service
          receives pre-fetched FHIR resources and returns typed results.
        </li>
        <li>
          <strong>Input validation</strong> goes through <code>zod</code>
          schemas in <code>index.ts</code>.
        </li>
        <li>
          Run <code>npm run typecheck</code>, <code>npm run lint</code>, and{" "}
          <code>npm run format:check</code> before opening a PR.
        </li>
      </ul>

      <h2>Pull requests</h2>
      <ol>
        <li>Fork and branch from <code>main</code>.</li>
        <li>
          Follow the repository’s{" "}
          <a
            href="https://github.com/darena-solutions/darena-health-community-mcp/blob/main/.github/pull_request_template.md"
            target="_blank"
            rel="noreferrer"
          >
            pull request template
          </a>
          .
        </li>
        <li>
          New tools should come with either real fixtures or unit-testable
          services — no placeholders merged to <code>main</code>.
        </li>
      </ol>

      <h2>Where to ask questions</h2>
      <ul>
        <li>
          Open a GitHub issue on{" "}
          <a
            href="https://github.com/darena-solutions/darena-health-community-mcp/issues"
            target="_blank"
            rel="noreferrer"
          >
            the repository
          </a>
          .
        </li>
        <li>
          For protocol-level questions, see the{" "}
          <a
            href="https://modelcontextprotocol.io/"
            target="_blank"
            rel="noreferrer"
          >
            MCP specification
          </a>{" "}
          and the{" "}
          <a
            href="https://www.sharponmcp.com/"
            target="_blank"
            rel="noreferrer"
          >
            SHARP-on-MCP
          </a>{" "}
          overlay.
        </li>
      </ul>
    </>
  );
}
