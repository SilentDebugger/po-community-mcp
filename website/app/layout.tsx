import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: {
    default: "DischargePlus MCP",
    template: "%s · DischargePlus MCP",
  },
  description:
    "FHIR-powered MCP server with tools for hospital discharge workflows: medication reconciliation, discharge instructions, readmission risk, follow-up planning, and cost auditing.",
  openGraph: {
    title: "DischargePlus MCP",
    description:
      "FHIR-powered MCP server with tools for hospital discharge workflows.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-ink-950 text-ink-100">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
