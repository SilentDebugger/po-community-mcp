import { z } from "zod";

const envSchema = z.object({
  PO_ENV: z.enum(["dev", "prod", "local"]).default("local"),
  PORT: z.coerce.number().default(5000),
  ALLOWED_HOST: z.string().optional(),
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
});

export type Config = z.infer<typeof envSchema>;

export function loadConfig(): Config {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error(
      "Invalid environment configuration:",
      result.error.format(),
    );
    process.exit(1);
  }
  return result.data;
}

export function getAllowedHosts(config: Config): string[] {
  // Always allow loopback so the container's own HEALTHCHECK and the
  // platform's internal health probes (Sevalla, Kubernetes-style probes,
  // etc.) succeed regardless of which public hostname is configured.
  const loopbackHosts = ["localhost", "127.0.0.1", "[::1]"];

  const envHosts: string[] = (() => {
    switch (config.PO_ENV) {
      case "dev":
        return ["ts.fhir-mcp.dev.promptopinion.ai"];
      case "prod":
        return ["ts.fhir-mcp.promptopinion.ai"];
      default:
        return [];
    }
  })();

  // ALLOWED_HOST may be a single host or a comma-separated list.
  // This is how Sevalla / custom-domain deployments inject their public hostname.
  const extraHosts = (config.ALLOWED_HOST ?? "")
    .split(",")
    .map((h) => h.trim())
    .filter(Boolean);

  return Array.from(new Set([...loopbackHosts, ...envHosts, ...extraHosts]));
}
