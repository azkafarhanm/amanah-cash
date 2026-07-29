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
  return [
    "Production environment is valid.",
    "  authentication: Google OAuth with database sessions",
    `  application origin: ${preflight.authentication.nextAuthUrl}`,
    "  database: configured SQLite file (server-only location redacted)",
    `  export maximum rows: ${preflight.exportLimits.maxRows}`,
    `  export maximum bytes: ${preflight.exportLimits.maxBytes ?? "disabled"}`
  ];
}
