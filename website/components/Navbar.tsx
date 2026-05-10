import Link from "next/link";

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-ink-800/70 bg-ink-950/80 backdrop-blur">
      <div className="mx-auto max-w-7xl px-6 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="inline-block h-6 w-6 rounded-md bg-gradient-to-br from-accent-400 to-accent-600 shadow-[0_0_16px_rgba(20,184,166,0.4)]" />
          <span className="font-semibold tracking-tight text-ink-50 group-hover:text-white">
            DischargePlus MCP
          </span>
          <span className="hidden sm:inline rounded-full text-[10px] uppercase tracking-wider px-2 py-0.5 bg-ink-800 text-ink-300 border border-ink-700 ml-2">
            Community
          </span>
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          <Link
            href="/wiki"
            className="px-3 py-1.5 rounded-md text-ink-200 hover:text-ink-50 hover:bg-ink-800/60"
          >
            Wiki
          </Link>
          <Link
            href="/wiki/getting-started"
            className="px-3 py-1.5 rounded-md text-ink-200 hover:text-ink-50 hover:bg-ink-800/60"
          >
            Getting Started
          </Link>
          <Link
            href="/wiki/tools"
            className="px-3 py-1.5 rounded-md text-ink-200 hover:text-ink-50 hover:bg-ink-800/60"
          >
            Tools
          </Link>
          <a
            href="https://github.com/darena-solutions/darena-health-community-mcp"
            target="_blank"
            rel="noreferrer"
            className="ml-2 px-3 py-1.5 rounded-md border border-ink-700 text-ink-100 hover:border-accent-500 hover:text-accent-400"
          >
            GitHub
          </a>
        </nav>
      </div>
    </header>
  );
}
