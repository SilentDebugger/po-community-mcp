"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { WIKI_NAV } from "@/lib/wiki-nav";

export function WikiSidebar() {
  const pathname = usePathname();

  return (
    <nav className="text-sm">
      {WIKI_NAV.map((section) => (
        <div key={section.title} className="mb-6">
          <div className="px-3 mb-2 text-[11px] uppercase tracking-[0.18em] text-ink-500 font-semibold">
            {section.title}
          </div>
          <ul className="space-y-0.5">
            {section.items.map((item) => {
              const active = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`block rounded-md px-3 py-1.5 transition-colors border-l-2 ${
                      active
                        ? "border-accent-400 bg-ink-800/80 text-ink-50"
                        : "border-transparent text-ink-300 hover:text-ink-50 hover:bg-ink-800/40"
                    }`}
                  >
                    {item.title}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
