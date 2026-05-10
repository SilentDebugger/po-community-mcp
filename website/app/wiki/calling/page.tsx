export const metadata = { title: "Calling the server" };

export default function CallingPage() {
  return (
    <>
      <div className="text-xs uppercase tracking-[0.2em] text-accent-400 mb-3">
        Integration
      </div>
      <h1>Calling the server</h1>
      <p>
        DischargePlus speaks MCP over <strong>Streamable HTTP</strong>. You can
        drive it with the official MCP SDK, from an LLM client that supports
        MCP, or with a plain HTTP client during debugging.
      </p>

      <h2>Endpoints</h2>
      <table>
        <thead>
          <tr>
            <th>Method</th>
            <th>Path</th>
            <th>Purpose</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <code>GET</code>
            </td>
            <td>
              <code>/health</code>
            </td>
            <td>
              Liveness probe. Returns{" "}
              <code>{`{ "status": "ok", "timestamp": "..." }`}</code>.
            </td>
          </tr>
          <tr>
            <td>
              <code>POST</code>
            </td>
            <td>
              <code>/mcp</code>
            </td>
            <td>
              MCP streamable-HTTP transport. All JSON-RPC methods go through
              this endpoint.
            </td>
          </tr>
        </tbody>
      </table>

      <h2>Listing tools</h2>
      <pre>{`POST /mcp
{
  "jsonrpc": "2.0",
  "method": "tools/list",
  "id": 1
}`}</pre>
      <p>Returns metadata for all nine tools registered at startup.</p>

      <h2>Invoking a tool</h2>
      <pre>{`POST /mcp
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "AssessReadmissionRisk",
    "arguments": { "patientId": "12345" }
  },
  "id": 2
}`}</pre>

      <h2>Using the official SDK</h2>
      <pre>{`import { Client } from "@modelcontextprotocol/sdk/client";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp";

const transport = new StreamableHTTPClientTransport(
  new URL("https://your-mcp.example.com/mcp"),
  {
    requestInit: {
      headers: {
        "x-fhir-server-url": fhirBaseUrl,
        "x-fhir-access-token": bearerToken,
        "x-patient-id": patientId,
      },
    },
  },
);

const client = new Client(
  { name: "my-app", version: "1.0.0" },
  { capabilities: {} },
);
await client.connect(transport);

const result = await client.callTool({
  name: "BuildDischargePacket",
  arguments: { readingLevel: "standard" },
});`}</pre>

      <h2>Error shape</h2>
      <p>
        Tools return human-readable errors either as JSON-RPC errors (for
        transport-level failures) or as MCP tool responses with{" "}
        <code>isError: true</code>. Examples:
      </p>
      <pre>{`// No patient context available
{ "content": [{ "type": "text", "text": "Patient id was not provided." }],
  "isError": true }

// Multiple patients matched in FindPatientId
{ "content": [{ "type": "text", "text": "More than one patient was found. Provide more details." }],
  "isError": true }`}</pre>
      <p>
        Inside <code>BuildDischargePacket</code>, a failing sub-tool does{" "}
        <strong>not</strong> fail the whole call — it is reported as{" "}
        <code>{`{ error: "..." }`}</code> on the corresponding field.
      </p>
    </>
  );
}
