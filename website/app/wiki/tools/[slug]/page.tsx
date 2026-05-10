import Link from "next/link";
import { notFound } from "next/navigation";
import { TOOLS, TOOL_BY_SLUG } from "@/lib/tools";

export function generateStaticParams() {
  return TOOLS.map((tool) => ({ slug: tool.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tool = TOOL_BY_SLUG[slug];
  if (!tool) return { title: "Tool" };
  return { title: tool.name, description: tool.summary };
}

export default async function ToolPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tool = TOOL_BY_SLUG[slug];
  if (!tool) notFound();

  const idx = TOOLS.findIndex((t) => t.slug === tool.slug);
  const prev = idx > 0 ? TOOLS[idx - 1] : null;
  const next = idx < TOOLS.length - 1 ? TOOLS[idx + 1] : null;

  return (
    <>
      <div className="text-xs uppercase tracking-[0.2em] text-accent-400 mb-3">
        {tool.category}
      </div>
      <h1>
        <code className="!bg-transparent !border-0 !text-ink-50 !px-0 !py-0">
          {tool.name}
        </code>
      </h1>
      <p className="!text-ink-300 !text-lg !leading-relaxed">{tool.summary}</p>

      <div className="not-prose flex flex-wrap gap-2 mt-4">
        {tool.fhirResources.map((r) => (
          <span
            key={r}
            className="rounded-full border border-ink-700 bg-ink-900/80 px-3 py-1 text-xs text-ink-200"
          >
            FHIR · {r}
          </span>
        ))}
      </div>

      <h2>Description</h2>
      <p>{tool.description}</p>

      <h2>Inputs</h2>
      {tool.inputs.length === 0 ? (
        <p className="text-ink-400">This tool takes no arguments.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Required</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {tool.inputs.map((input) => (
              <tr key={input.name}>
                <td>
                  <code>{input.name}</code>
                </td>
                <td>
                  <code>{input.type}</code>
                </td>
                <td>{input.required ? "Yes" : "No"}</td>
                <td>{input.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h2>Output</h2>
      <pre>{tool.output.shape}</pre>
      {tool.output.notes && tool.output.notes.length > 0 && (
        <ul>
          {tool.output.notes.map((note, i) => (
            <li key={i}>{note}</li>
          ))}
        </ul>
      )}

      <h2>Example call</h2>
      <pre>{`POST /mcp
x-fhir-server-url:   https://fhir.example.com/r4
x-fhir-access-token: <bearer token>
x-patient-id:        12345

{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "${tool.name}",
    "arguments": ${exampleArgs(tool.slug)}
  },
  "id": 1
}`}</pre>

      <div className="not-prose mt-12 flex items-center justify-between text-sm">
        {prev ? (
          <Link
            href={`/wiki/tools/${prev.slug}`}
            className="text-ink-300 hover:text-accent-400"
          >
            ← {prev.name}
          </Link>
        ) : (
          <Link href="/wiki/tools" className="text-ink-300 hover:text-accent-400">
            ← All tools
          </Link>
        )}
        {next ? (
          <Link
            href={`/wiki/tools/${next.slug}`}
            className="text-ink-300 hover:text-accent-400"
          >
            {next.name} →
          </Link>
        ) : (
          <Link href="/wiki" className="text-ink-300 hover:text-accent-400">
            Back to wiki home →
          </Link>
        )}
      </div>
    </>
  );
}

function exampleArgs(slug: string): string {
  switch (slug) {
    case "find-patient-id":
      return `{ "firstName": "Jane", "lastName": "Doe" }`;
    case "list-encounters":
      return `{ "classFilter": "IMP" }`;
    case "build-discharge-packet":
    case "generate-discharge-instructions":
      return `{ "readingLevel": "standard" }`;
    default:
      return `{}`;
  }
}
