import type { ReportExportAdapter, ReportExportDocument } from "@/reports/export-contract";

export type ExportFormat = "csv" | "xlsx" | "pdf";

export type ExportSummaryItem = {
  label: string;
  value: string;
};

export type ExportRow = Readonly<Record<string, string>>;
export type ExportDocument = ReportExportDocument<ReadonlyArray<ExportSummaryItem>, ExportRow>;
export type ExportAdapter = ReportExportAdapter<ReadonlyArray<ExportSummaryItem>, ExportRow>;

export type ExportFormatDescriptor = {
  format: ExportFormat;
  label: string;
  implemented: boolean;
};

export type ExportResult = {
  bytes: Uint8Array;
  fileName: string;
  format: ExportFormat;
  mediaType: string;
};
