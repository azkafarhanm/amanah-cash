import { csvExportAdapter } from "@/exports/csv-adapter";
import { excelExportAdapter } from "@/exports/excel-adapter";
import { ExportFormatUnavailableError, ExportValidationError } from "@/exports/errors";
import type { ExportAdapter, ExportFormat, ExportFormatDescriptor } from "@/exports/types";

const FORMATS: ReadonlyArray<Omit<ExportFormatDescriptor, "implemented">> = [
  { format: "csv", label: "CSV" },
  { format: "xlsx", label: "Excel" },
  { format: "pdf", label: "PDF" }
];

export function createExportRegistry(entries: ReadonlyArray<readonly [ExportFormat, ExportAdapter]>) {
  const adapters = new Map(entries);
  const known = new Set(FORMATS.map((item) => item.format));

  return {
    formats(): ReadonlyArray<ExportFormatDescriptor> {
      return FORMATS.map((item) => ({ ...item, implemented: adapters.has(item.format) }));
    },
    availableFormats(): ReadonlyArray<ExportFormatDescriptor> {
      return this.formats().filter((item) => item.implemented);
    },
    resolve(value: unknown): { format: ExportFormat; adapter: ExportAdapter } {
      if (typeof value !== "string" || !known.has(value as ExportFormat)) throw new ExportValidationError("Format ekspor tidak valid.");
      const format = value as ExportFormat;
      const adapter = adapters.get(format);
      if (!adapter) throw new ExportFormatUnavailableError();
      return { format, adapter };
    }
  };
}

export const exportRegistry = createExportRegistry([
  ["csv", csvExportAdapter],
  ["xlsx", excelExportAdapter]
]);
