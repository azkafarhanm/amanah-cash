export class ExportValidationError extends Error {
  readonly status = 400;
  readonly code = "EXPORT_VALIDATION";

  constructor(message = "Permintaan ekspor tidak valid.") {
    super(message);
    this.name = "ExportValidationError";
  }
}

export class ExportFormatUnavailableError extends Error {
  readonly status = 501;
  readonly code = "EXPORT_FORMAT_UNAVAILABLE";

  constructor() {
    super("Format ekspor belum tersedia.");
    this.name = "ExportFormatUnavailableError";
  }
}

export class ExportLimitExceededError extends Error {
  readonly status = 413;
  readonly code = "EXPORT_LIMIT_EXCEEDED";

  constructor() {
    super("Data laporan terlalu besar untuk diekspor. Persempit periode atau filter, lalu coba lagi.");
    this.name = "ExportLimitExceededError";
  }
}

export function isExportError(error: unknown): error is ExportValidationError | ExportFormatUnavailableError | ExportLimitExceededError {
  return error instanceof ExportValidationError || error instanceof ExportFormatUnavailableError || error instanceof ExportLimitExceededError;
}
