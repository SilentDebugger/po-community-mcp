export const metadata = { title: "Deploy on Sevalla" };

export default function DeploymentPage() {
  return (
    <>
      <div className="text-xs uppercase tracking-[0.2em] text-accent-400 mb-3">
        Operations
      </div>
      <h1>Deploying on Sevalla</h1>
      <p>
        Sevalla runs Docker images natively, which is exactly how this
        repository is packaged. Both the MCP server (the{" "}
        <code>typescript/</code> folder) and this wiki site (the{" "}
        <code>website/</code> folder) ship their own <code>Dockerfile</code>{" "}
        and can be deployed as two separate apps on a single Sevalla project.
      </p>

      <h2>Recommended layout</h2>
      <table>
        <thead>
          <tr>
            <th>Sevalla app</th>
            <th>Source</th>
            <th>Exposed port</th>
            <th>Purpose</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <code>mcp-server</code>
            </td>
            <td>
              <code>./typescript</code>
            </td>
            <td>
              <code>5000</code>
            </td>
            <td>Serves the MCP protocol over HTTP.</td>
          </tr>
          <tr>
            <td>
              <code>wiki</code>
            </td>
            <td>
              <code>./website</code>
            </td>
            <td>
              <code>3000</code>
            </td>
            <td>This documentation site.</td>
          </tr>
        </tbody>
      </table>

      <h2>1. Deploy the MCP server</h2>
      <ol>
        <li>
          In Sevalla, create an <strong>Application</strong> → connect the
          GitHub repo → pick the <code>typescript/</code> sub-directory.
        </li>
        <li>
          Choose the <strong>Dockerfile</strong> build pack. Sevalla will use{" "}
          <code>typescript/Dockerfile</code> automatically.
        </li>
        <li>
          Set the following environment variables:
          <ul>
            <li>
              <code>PO_ENV=prod</code>
            </li>
            <li>
              <code>PORT=5000</code> (Sevalla will route the public URL to
              this port)
            </li>
            <li>
              <code>LOG_LEVEL=info</code>
            </li>
          </ul>
        </li>
        <li>
          Set the <strong>health check path</strong> to <code>/health</code>.
        </li>
        <li>Deploy. Note the public HTTPS URL Sevalla assigns.</li>
      </ol>

      <h2>2. Deploy the wiki</h2>
      <ol>
        <li>
          Create a second <strong>Application</strong> pointing at the{" "}
          <code>website/</code> folder.
        </li>
        <li>
          Sevalla will detect <code>website/Dockerfile</code> and build the
          Next.js standalone output.
        </li>
        <li>
          Set <code>PORT=3000</code>.
        </li>
        <li>Deploy. Point a subdomain (e.g. <code>docs.yourdomain.com</code>) at it.</li>
      </ol>

      <h2>3. Point clients at your MCP server</h2>
      <p>
        Once the MCP app is live, an MCP client only needs the public URL and
        the FHIR headers:
      </p>
      <pre>{`POST https://mcp.yourdomain.com/mcp
x-fhir-server-url:   https://fhir.example.com/r4
x-fhir-access-token: <bearer token>
x-patient-id:        12345`}</pre>
      <p>
        For Prompt Opinion, register the URL in your workspace’s MCP server
        settings; the FHIR context headers are set automatically.
      </p>

      <h2>Health checks and observability</h2>
      <ul>
        <li>
          <strong>Liveness:</strong> Sevalla’s built-in health probe calls
          <code> /health </code>on the MCP app and expects a 200 response.
        </li>
        <li>
          <strong>Logs:</strong> The server emits JSON-per-line logs via
          <code> src/logger.ts</code>. Sevalla collects stdout/stderr
          automatically.
        </li>
        <li>
          <strong>Scaling:</strong> Both apps are fully stateless, so horizontal
          autoscaling on Sevalla is safe.
        </li>
      </ul>

      <h2>Alternative: single-container deploy</h2>
      <p>
        If you prefer one app, you can use the root{" "}
        <code>docker-compose-local.yml</code> as a template: it builds the{" "}
        <code>typescript/</code> image and maps port <code>55000 → 5000</code>.
        Sevalla Compose stacks will work with this file as-is — useful for
        preview environments.
      </p>
    </>
  );
}
