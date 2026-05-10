import { TOOLS } from "./tools";

export interface NavItem {
  title: string;
  href: string;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

export const WIKI_NAV: NavSection[] = [
  {
    title: "Overview",
    items: [
      { title: "Introduction", href: "/wiki" },
      { title: "Architecture", href: "/wiki/architecture" },
      { title: "Output format", href: "/wiki/output" },
    ],
  },
  {
    title: "Integration",
    items: [
      { title: "Getting started", href: "/wiki/getting-started" },
      { title: "Authentication & context", href: "/wiki/authentication" },
      { title: "Calling the server", href: "/wiki/calling" },
    ],
  },
  {
    title: "Tools",
    items: [
      { title: "All tools", href: "/wiki/tools" },
      ...TOOLS.map((tool) => ({
        title: tool.name,
        href: `/wiki/tools/${tool.slug}`,
      })),
    ],
  },
  {
    title: "Operations",
    items: [
      { title: "Deploy on Sevalla", href: "/wiki/deployment" },
      { title: "Contributing", href: "/wiki/contributing" },
    ],
  },
];
