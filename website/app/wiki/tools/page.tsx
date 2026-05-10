import Link from "next/link";
import { TOOLS } from "@/lib/tools";

export const metadata = { title: "Tools" };

const CATEGORY_BLURBS: Record<string, string> = {
  Identity: "Resolve patients and their encounters.",
  Clinical: "Produce clinical artifacts directly over FHIR.",
  Planning: "Turn clinical state into actionable follow-up.",
  Financial: "Surface savings opportunities.",
  Orchestrator: "Run everything above in one call.",
};

export default function ToolsIndexPage() {
  const grouped = TOOLS.reduce<Record<string, typeof TOOLS>>((acc, tool) => {
    (acc[tool.category] ||= []).push(tool);
    return acc;
  }, {});

  return (
    <>
      <div className="text-xs uppercase tracking-[0.2em] text-accent-400 mb-3">
        Tools
      </div>
      <h1>All tools</h1>
      <p>
        DischargePlus registers nine MCP tools. Every tool accepts its FHIR
        connection through request headers (see{" "}
        <Link href="/wiki/authentication">Authentication &amp; context</Link>)
        and every clinical tool accepts an optional <code>patientId</code> via
        either its input schema or the <code>x-patient-id</code> header.
      </p>

      {Object.entries(grouped).map(([category, tools]) => (
        <section key={category}>
          <h2>{category}</h2>
          <p className="text-ink-400">{CATEGORY_BLURBS[category]}</p>
          <div className="not-prose grid gap-3 sm:grid-cols-2 my-4">
            {tools.map((tool) => (
              <Link
                key={tool.slug}
                href={`/wiki/tools/${tool.slug}`}
                className="group rounded-xl border border-ink-800 bg-ink-900/60 p-4 hover:border-accent-500/60"
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
                <p className="text-sm text-ink-400 leading-6">{tool.summary}</p>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </>
  );
}
