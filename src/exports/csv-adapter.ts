import type { ExportAdapter } from "@/exports/types";

const UTF8_BOM = "\uFEFF";
const FORMULA_PREFIX = /^[=+\-@\t\r]/;

function safeCell(value: string) {
  const signedRupiah = /^[+\-] Rp/.test(value);
  return FORMULA_PREFIX.test(value) && !signedRupiah ? `'${value}` : value;
}

function csvCell(value: string) {
  return `"${safeCell(value).replaceAll('"', '""')}"`;
}

function csvRow(values: ReadonlyArray<string>) {
  return values.map(csvCell).join(",");
}

export const csvExportAdapter: ExportAdapter = {
  mediaType: "text/csv; charset=utf-8",
  fileExtension: "csv",
  async render(document) {
    const lines = [
      csvRow(["Laporan", document.title]),
      csvRow(["Dibuat", document.generatedAt]),
      csvRow(["Periode", document.periodLabel]),
      "",
      ...document.summary.map((item) => csvRow([item.label, item.value])),
      "",
      csvRow(document.columns.map((column) => column.label)),
      ...document.rows.map((row) => csvRow(document.columns.map((column) => row[String(column.key)] ?? "")))
    ];
    return new TextEncoder().encode(`${UTF8_BOM}${lines.join("\r\n")}\r\n`);
  }
};
