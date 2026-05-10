import { WikiSidebar } from "@/components/WikiSidebar";

export default function WikiLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-7xl px-6 py-10 grid gap-10 md:grid-cols-[240px_minmax(0,1fr)]">
      <aside className="md:sticky md:top-20 md:self-start md:max-h-[calc(100vh-5rem)] md:overflow-y-auto">
        <WikiSidebar />
      </aside>
      <article className="wiki-content min-w-0">{children}</article>
    </div>
  );
}
