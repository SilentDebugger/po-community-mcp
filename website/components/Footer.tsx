import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-ink-800/70 bg-ink-950">
      <div className="mx-auto max-w-7xl px-6 py-10 grid gap-8 md:grid-cols-4 text-sm">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-block h-5 w-5 rounded bg-gradient-to-br from-accent-400 to-accent-600" />
            <span className="font-semibold text-ink-50">DischargePlus MCP</span>
          </div>
          <p className="text-ink-400 leading-6">
            An open-source community MCP server bringing FHIR data to discharge
            workflows.
          </p>
        </div>
        <div>
          <div className="text-ink-50 font-semibold mb-3">Docs</div>
          <ul className="space-y-2 text-ink-300">
            <li>
              <Link href="/wiki" className="hover:text-accent-400">
                Wiki home
              </Link>
            </li>
            <li>
              <Link
                href="/wiki/getting-started"
                className="hover:text-accent-400"
              >
                Getting started
              </Link>
            </li>
            <li>
              <Link
                href="/wiki/architecture"
                className="hover:text-accent-400"
              >
                Architecture
              </Link>
            </li>
            <li>
              <Link href="/wiki/deployment" className="hover:text-accent-400">
                Deploy on Sevalla
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <div className="text-ink-50 font-semibold mb-3">Tools</div>
          <ul className="space-y-2 text-ink-300">
            <li>
              <Link
                href="/wiki/tools/build-discharge-packet"
                className="hover:text-accent-400"
              >
                BuildDischargePacket
              </Link>
            </li>
            <li>
              <Link
                href="/wiki/tools/reconcile-medications"
                className="hover:text-accent-400"
              >
                ReconcileMedications
              </Link>
            </li>
            <li>
              <Link
                href="/wiki/tools/assess-readmission-risk"
                className="hover:text-accent-400"
              >
                AssessReadmissionRisk
              </Link>
            </li>
            <li>
              <Link href="/wiki/tools" className="hover:text-accent-400">
                All tools →
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <div className="text-ink-50 font-semibold mb-3">Project</div>
          <ul className="space-y-2 text-ink-300">
            <li>
              <a
                href="https://promptopinion.ai"
                target="_blank"
                rel="noreferrer"
                className="hover:text-accent-400"
              >
                Prompt Opinion
              </a>
            </li>
            <li>
              <a
                href="https://www.sharponmcp.com/"
                target="_blank"
                rel="noreferrer"
                className="hover:text-accent-400"
              >
                SHARP-on-MCP spec
              </a>
            </li>
            <li>
              <a
                href="https://github.com/darena-solutions/darena-health-community-mcp"
                target="_blank"
                rel="noreferrer"
                className="hover:text-accent-400"
              >
                GitHub
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-ink-800/70">
        <div className="mx-auto max-w-7xl px-6 py-5 text-xs text-ink-500 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            © {new Date().getFullYear()} Darena Solutions. Licensed under ISC.
          </div>
          <div>
            Not medical advice. Intended for developer and operational use.
          </div>
        </div>
      </div>
    </footer>
  );
}
