import {
  loadAuthenticationEnvironment,
  type AuthenticationEnvironment
} from "@/auth/environment";
import { loadExportLimits, type ExportLimits } from "@/exports/config";

export type ProductionPreflight = Readonly<{
  authentication: AuthenticationEnvironment;
  exportLimits: ExportLimits;
}>;

type PreflightEnvironment = Readonly<Record<string, string | undefined>>;

export function loadProductionPreflight(
  environment: PreflightEnvironment = process.env
): ProductionPreflight {
  const productionEnvironment = { ...environment, NODE_ENV: "production" as const };

  return {
    authentication: loadAuthenticationEnvironment(productionEnvironment),
    exportLimits: loadExportLimits(productionEnvironment)
  };
}

export function formatProductionPreflight(preflight: ProductionPreflight): readonly string[] {
  const isPostgres =
    preflight.authentication.databaseUrl.startsWith("postgres://") ||
    preflight.authentication.databaseUrl.startsWith("postgresql://");
  const dbLabel = isPostgres
    ? "configured PostgreSQL database (server-only location redacted)"
    : "configured SQLite file (server-only location redacted)";

  return [
    "Production environment is valid.",
    "  authentication: Google OAuth with database sessions",
    `  application origin: ${preflight.authentication.nextAuthUrl}`,
    `  database: ${dbLabel}`,
    `  export maximum rows: ${preflight.exportLimits.maxRows}`,
    `  export maximum bytes: ${preflight.exportLimits.maxBytes ?? "disabled"}`
  ];
}
