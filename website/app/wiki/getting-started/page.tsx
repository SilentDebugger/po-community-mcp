export const metadata = { title: "Getting started" };

export default function GettingStartedPage() {
  return (
    <>
      <div className="text-xs uppercase tracking-[0.2em] text-accent-400 mb-3">
        Integration
      </div>
      <h1>Getting started</h1>
      <p>
        You can run DischargePlus directly with Node during development, or
        boot the Dockerised version for a production-shaped environment.
      </p>

      <h2>Prerequisites</h2>
      <ul>
        <li>Node.js 20 or newer (only for the non-Docker path).</li>
        <li>Docker 24+ with Compose v2 for the container path.</li>
        <li>Access to a FHIR R4 server and a bearer token you can use against it.</li>
      </ul>

      <h2>1. Clone the repository</h2>
      <pre>{`git clone https://github.com/darena-solutions/darena-health-community-mcp.git
cd darena-health-community-mcp`}</pre>

      <h2>2. Run locally with Node</h2>
      <pre>{`cd typescript
npm install
npm run dev`}</pre>
      <p>
        The dev script uses <code>tsx watch</code> for hot reload. The server
        listens on <code>PORT</code> (default <code>5000</code>).
      </p>

      <h2>2b. Or run locally with Docker Compose</h2>
      <p>
        From the repo root, a pre-wired compose file maps port{" "}
        <code>55000</code> on the host to the server:
      </p>
      <pre>{`docker compose -f docker-compose-local.yml up --build`}</pre>
      <p>
        Helper scripts for Windows/Powershell are under <code>scripts/</code>:
        <code>run-docker.ps1</code>, <code>reset-docker.ps1</code>, and{" "}
        <code>delete-docker.ps1</code>.
      </p>

      <h2>3. Verify it is up</h2>
      <pre>{`curl http://localhost:5000/health
# → { "status": "ok", "timestamp": "..." }`}</pre>

      <h2>4. Call a tool</h2>
      <p>
        Any MCP request goes through <code>POST /mcp</code>. The server expects
        the FHIR connection info on request headers — see{" "}
        <a href="/wiki/authentication">Authentication &amp; context</a> for the
        full list.
      </p>
      <pre>{`curl -X POST http://localhost:5000/mcp \\
  -H "Content-Type: application/json" \\
  -H "x-fhir-server-url: https://fhir.example.com/r4" \\
  -H "x-fhir-access-token: <bearer token>" \\
  -H "x-patient-id: 12345" \\
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/call",
    "params": {
      "name": "GetPatientAge",
      "arguments": {}
    },
    "id": 1
  }'`}</pre>

      <h2>Environment variables</h2>
      <p>
        All variables are validated at startup. Misconfiguration aborts the
        process.
      </p>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Default</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <code>PO_ENV</code>
            </td>
            <td>
              <code>local</code>
            </td>
            <td>
              <code>local</code>, <code>dev</code>, or <code>prod</code>.
              Gates which extra hosts are allowed through the MCP transport.
            </td>
          </tr>
          <tr>
            <td>
              <code>PORT</code>
            </td>
            <td>
              <code>5000</code>
            </td>
            <td>HTTP port the server binds to.</td>
          </tr>
          <tr>
            <td>
              <code>ALLOWED_HOST</code>
            </td>
            <td>—</td>
            <td>
              Extra host/origin to accept (only honoured when{" "}
              <code>PO_ENV=local</code>).
            </td>
          </tr>
          <tr>
            <td>
              <code>LOG_LEVEL</code>
            </td>
            <td>
              <code>info</code>
            </td>
            <td>
              One of <code>debug</code>, <code>info</code>, <code>warn</code>,{" "}
              <code>error</code>.
            </td>
          </tr>
        </tbody>
      </table>

      <h2>Scripts at a glance</h2>
      <table>
        <thead>
          <tr>
            <th>Script</th>
            <th>What it does</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <code>npm run dev</code>
            </td>
            <td>
              <code>tsx watch src/index.ts</code> — hot reload dev server.
            </td>
          </tr>
          <tr>
            <td>
              <code>npm run build</code>
            </td>
            <td>Compile TypeScript to <code>dist/</code>.</td>
          </tr>
          <tr>
            <td>
              <code>npm start</code>
            </td>
            <td>Run the compiled output.</td>
          </tr>
          <tr>
            <td>
              <code>npm run typecheck</code>
            </td>
            <td>
              <code>tsc --noEmit</code>.
            </td>
          </tr>
          <tr>
            <td>
              <code>npm run lint</code> / <code>lint:fix</code>
            </td>
            <td>ESLint on <code>src/</code>.</td>
          </tr>
          <tr>
            <td>
              <code>npm run format</code> / <code>format:check</code>
            </td>
            <td>Prettier on <code>src/</code>.</td>
          </tr>
        </tbody>
      </table>
    </>
  );
}
