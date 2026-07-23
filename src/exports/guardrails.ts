import type { ExportLimits } from "@/exports/config";
import { ExportLimitExceededError } from "@/exports/errors";
import type { ExportDocument } from "@/exports/types";

const encoder = new TextEncoder();

function byteLength(value: string) {
  return encoder.encode(value).byteLength;
}

export function estimateExportBytes(document: ExportDocument, totalRows: number) {
  const metadataBytes = byteLength(document.title) + byteLength(document.generatedAt) + byteLength(document.periodLabel)
    + document.summary.reduce((total, item) => total + byteLength(item.label) + byteLength(item.value) + 8, 0)
    + document.columns.reduce((total, column) => total + byteLength(column.label) + 4, 0)
    + 64;
  if (!document.rows.length || totalRows === 0) return metadataBytes;
  const sampledRowsBytes = document.rows.reduce((total, row) => total + document.columns.reduce(
    (rowTotal, column) => rowTotal + byteLength(row[column.key] ?? "") + 4,
    2
  ), 0);
  return metadataBytes + Math.ceil(sampledRowsBytes / document.rows.length) * totalRows;
}

export function enforceExportPreflight({
  limits,
  sampleDocument,
  totalRows
}: {
  limits: ExportLimits;
  sampleDocument: ExportDocument;
  totalRows: number;
}) {
  if (totalRows > limits.maxRows) throw new ExportLimitExceededError();
  if (limits.maxBytes !== null && estimateExportBytes(sampleDocument, totalRows) > limits.maxBytes) {
    throw new ExportLimitExceededError();
  }
}

export function enforceRenderedExportSize(byteLength: number, limits: ExportLimits) {
  if (limits.maxBytes !== null && byteLength > limits.maxBytes) throw new ExportLimitExceededError();
}
