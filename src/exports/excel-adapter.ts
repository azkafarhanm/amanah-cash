import ExcelJS from "exceljs";
import type { ExportAdapter, ExportDocument } from "@/exports/types";

const MINIMUM_COLUMN_WIDTH = 12;
const MAXIMUM_COLUMN_WIDTH = 40;
const CELL_PADDING = 2;

function displayWidth(value: string) {
  return Math.max(...value.split(/\r?\n/).map((line) => Array.from(line).length), 0);
}

function columnWidth(document: ExportDocument, key: string, label: string) {
  const widest = document.rows.reduce((width, row) => Math.max(width, displayWidth(row[key] ?? "")), displayWidth(label));
  return Math.min(MAXIMUM_COLUMN_WIDTH, Math.max(MINIMUM_COLUMN_WIDTH, widest + CELL_PADDING));
}

function isNumericDisplay(value: string) {
  return /^(?:[+−-]\s*)?Rp(?:\s|\u00a0)*[\d.]+$/.test(value) || /^\d{1,3}(?:\.\d{3})*$/.test(value);
}

function setMetadata(worksheet: ExcelJS.Worksheet, row: number, column: number, label: string, value: string) {
  worksheet.getCell(row, column).value = label;
  worksheet.getCell(row, column).font = { bold: true };
  worksheet.getCell(row, column + 1).value = value;
  worksheet.getCell(row, column + 1).alignment = { horizontal: isNumericDisplay(value) ? "right" : "left", vertical: "top", wrapText: true };
}

export const excelExportAdapter: ExportAdapter = {
  mediaType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  fileExtension: "xlsx",
  async render(document) {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "Amanah Cash";
    workbook.title = document.title;
    workbook.subject = document.periodLabel;

    const worksheet = workbook.addWorksheet("Laporan");
    const headerRow = worksheet.addRow(document.columns.map((column) => column.label));
    headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
    headerRow.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1F4E78" } };
    headerRow.alignment = { horizontal: "left", vertical: "middle", wrapText: true };
    headerRow.height = 24;

    for (const item of document.rows) {
      const row = worksheet.addRow(document.columns.map((column) => item[String(column.key)] ?? ""));
      row.eachCell((cell) => {
        const value = typeof cell.value === "string" ? cell.value : "";
        cell.alignment = { horizontal: isNumericDisplay(value) ? "right" : "left", vertical: "top", wrapText: true };
      });
    }

    document.columns.forEach((column, index) => {
      worksheet.getColumn(index + 1).width = columnWidth(document, String(column.key), column.label);
    });

    const metadataColumn = document.columns.length + 2;
    worksheet.mergeCells(1, metadataColumn, 1, metadataColumn + 1);
    const titleCell = worksheet.getCell(1, metadataColumn);
    titleCell.value = document.title;
    titleCell.font = { bold: true, size: 14 };
    titleCell.alignment = { vertical: "middle", wrapText: true };
    setMetadata(worksheet, 2, metadataColumn, "Dibuat", document.generatedAt);
    setMetadata(worksheet, 3, metadataColumn, "Periode", document.periodLabel);
    document.summary.forEach((item, index) => setMetadata(worksheet, index + 5, metadataColumn, item.label, item.value));
    worksheet.getColumn(metadataColumn).width = 22;
    worksheet.getColumn(metadataColumn + 1).width = 28;

    worksheet.views = [{ state: "frozen", ySplit: 1, topLeftCell: "A2" }];
    if (document.columns.length) {
      worksheet.autoFilter = {
        from: { row: headerRow.number, column: 1 },
        to: { row: headerRow.number + document.rows.length, column: document.columns.length }
      };
    }

    const buffer = await workbook.xlsx.writeBuffer();
    return new Uint8Array(buffer);
  }
};
