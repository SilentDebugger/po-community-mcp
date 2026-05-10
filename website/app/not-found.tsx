import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6">
      <div className="text-xs uppercase tracking-[0.2em] text-accent-400 mb-3">
        404
      </div>
      <h1 className="text-4xl font-semibold tracking-tight text-ink-50 mb-3">
        Page not found
      </h1>
      <p className="text-ink-400 max-w-md">
        That URL isn&apos;t part of the wiki. Try the{" "}
        <Link href="/wiki" className="text-accent-400 underline">
          wiki home
        </Link>{" "}
        or jump straight to{" "}
        <Link href="/wiki/tools" className="text-accent-400 underline">
          the tools
        </Link>
        .
      </p>
    </div>
  );
}
