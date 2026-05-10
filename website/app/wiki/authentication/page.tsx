export const metadata = { title: "Authentication & context" };

export default function AuthenticationPage() {
  return (
    <>
      <div className="text-xs uppercase tracking-[0.2em] text-accent-400 mb-3">
        Integration
      </div>
      <h1>Authentication &amp; context</h1>
      <p>
        DischargePlus is intentionally stateless. It does not hold any FHIR
        credentials on its own — instead, the caller passes everything it
        needs on each <code>POST /mcp</code> request as headers. The server
        forwards the bearer token straight to the FHIR server and discards it
        at the end of the request.
      </p>

      <h2>Headers the server reads</h2>
      <table>
        <thead>
          <tr>
            <th>Header</th>
            <th>Required</th>
            <th>Purpose</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <code>x-fhir-server-url</code>
            </td>
            <td>Yes</td>
            <td>
              Base URL of the target FHIR R4 server (e.g.{" "}
              <code>https://fhir.example.com/r4</code>). Used for every
              resource fetch performed by the called tool.
            </td>
          </tr>
          <tr>
            <td>
              <code>x-fhir-access-token</code>
            </td>
            <td>Usually</td>
            <td>
              Bearer token the MCP server will pass as{" "}
              <code>Authorization: Bearer …</code> on outgoing FHIR requests.
              Optional only for FHIR servers that allow anonymous reads.
            </td>
          </tr>
          <tr>
            <td>
              <code>x-patient-id</code>
            </td>
            <td>Optional</td>
            <td>
              Patient context — when set, any tool that takes a{" "}
              <code>patientId</code> argument can omit it and will fall back to
              this header. Ideal for LLM clients that already know the patient
              (Prompt Opinion sets it automatically).
            </td>
          </tr>
        </tbody>
      </table>

      <h2>Capability advertised to clients</h2>
      <p>
        Each MCP session advertises a Prompt Opinion-specific capability under{" "}
        <code>ai.promptopinion/fhir-context</code>. Clients that understand it
        will auto-populate the headers above; other clients just need to set
        them themselves.
      </p>

      <h2>Security notes</h2>
      <ul>
        <li>
          The server never persists FHIR tokens, patient ids, or resource data.
          Logs contain only whether a token was present, never its value.
        </li>
        <li>
          Host and origin validation is enforced by the MCP SDK. In production
          mode, <code>createMcpExpressApp</code> only accepts a small set of
          trusted hosts; the list is configurable through <code>PO_ENV</code>{" "}
          and <code>ALLOWED_HOST</code>.
        </li>
        <li>
          You should terminate TLS in front of this service (via your PaaS or a
          reverse proxy). The upstream FHIR call uses whichever scheme is in{" "}
          <code>x-fhir-server-url</code>.
        </li>
      </ul>

      <h2>Example with headers and a patient-context tool</h2>
      <pre>{`curl -X POST https://your-mcp.example.com/mcp \\
  -H "Content-Type: application/json" \\
  -H "x-fhir-server-url: https://fhir.example.com/r4" \\
  -H "x-fhir-access-token: <bearer token>" \\
  -H "x-patient-id: 12345" \\
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/call",
    "params": {
      "name": "BuildDischargePacket",
      "arguments": { "readingLevel": "standard" }
    },
    "id": 1
  }'`}</pre>
      <p>
        Because <code>x-patient-id</code> is set, the{" "}
        <code>BuildDischargePacket</code> call does not need to include a{" "}
        <code>patientId</code> argument.
      </p>
    </>
  );
}
