export const DEFAULT_EXPORT_MAX_ROWS = 10_000;

export type ExportLimits = Readonly<{
  maxRows: number;
  maxBytes: number | null;
}>;

export class ExportConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ExportConfigurationError";
  }
}

type ExportEnvironment = Readonly<Record<string, string | undefined>>;

function positiveInteger(environment: ExportEnvironment, name: string, fallback?: number) {
  const raw = environment[name]?.trim();
  if (!raw && fallback !== undefined) return fallback;
  if (!raw) return null;
  const value = Number(raw);
  if (!Number.isSafeInteger(value) || value <= 0) {
    throw new ExportConfigurationError(`${name} must be a positive integer`);
  }
  return value;
}

export function loadExportLimits(environment: ExportEnvironment = process.env): ExportLimits {
  return {
    maxRows: positiveInteger(environment, "EXPORT_MAX_ROWS", DEFAULT_EXPORT_MAX_ROWS)!,
    maxBytes: positiveInteger(environment, "EXPORT_MAX_BYTES")
  };
}
