import ExcelJS from "exceljs";
import type { ExportAdapter, ExportDocument } from "@/exports/types";

const MINIMUM_COLUMN_WIDTH = 12;
const MAXIMUM_COLUMN_WIDTH = 40;
const CELL_PADDING = 2;
const TITLE_ROW = 1;
const METADATA_START_ROW = 2;
const SUMMARY_HEADING_ROW = 5;
const HEADER_FILL = "FFF1F2F3";
const BORDER_COLOR = "FFC9CDD1";
const TEXT_COLOR = "FF202428";
const SECONDARY_TEXT_COLOR = "FF555C63";

const PREFERRED_COLUMN_WIDTHS: Readonly<Record<string, number>> = {
  occurredAt: 20,
  student: 24,
  studentStatus: 15,
  type: 14,
  correctionDirection: 15,
  amount: 18,
  balanceAfter: 22,
  notes: 32,
  reason: 30,
  revision: 11,
  updatedAt: 20,
  operator: 20,
  auditReference: 18,
  category: 18,
  subject: 24,
  description: 36
};

const CENTERED_COLUMNS = new Set(["studentStatus", "type", "correctionDirection", "revision", "category"]);

function displayWidth(value: string) {
  return Math.max(...value.split(/\r?\n/).map((line) => Array.from(line).length), 0);
}

function columnWidth(document: ExportDocument, key: string, label: string) {
  const widest = document.rows.reduce((width, row) => Math.max(width, displayWidth(row[key] ?? "")), displayWidth(label));
  const preferred = PREFERRED_COLUMN_WIDTHS[key] ?? MINIMUM_COLUMN_WIDTH;
  return Math.min(MAXIMUM_COLUMN_WIDTH, Math.max(MINIMUM_COLUMN_WIDTH, preferred, widest + CELL_PADDING));
}

function isNumericDisplay(value: string) {
  return /^(?:[+−-]\s*)?Rp(?:\s|\u00a0)*[\d.]+$/.test(value) || /^\d{1,3}(?:\.\d{3})*$/.test(value);
}

function horizontalAlignment(key: string, value: string): ExcelJS.Alignment["horizontal"] {
  if (isNumericDisplay(value)) return "right";
  if (CENTERED_COLUMNS.has(key)) return "center";
  return "left";
}

function columnLetter(columnNumber: number) {
  let value = columnNumber;
  let letters = "";
  while (value > 0) {
    const remainder = (value - 1) % 26;
    letters = String.fromCharCode(65 + remainder) + letters;
    value = Math.floor((value - 1) / 26);
  }
  return letters;
}

function titleEndColumn(columnCount: number) {
  return Math.max(1, columnCount - 1);
}

function applyBottomBorder(row: ExcelJS.Row, columnCount: number, style: ExcelJS.BorderStyle = "thin") {
  for (let column = 1; column <= columnCount; column += 1) {
    row.getCell(column).border = { bottom: { style, color: { argb: BORDER_COLOR } } };
  }
}

export const excelExportAdapter: ExportAdapter = {
  mediaType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  fileExtension: "xlsx",
  async render(document) {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "Amanah Cash";
    workbook.title = document.title;
    workbook.subject = document.periodLabel;

    const worksheet = workbook.addWorksheet("Laporan", {
      properties: { defaultRowHeight: 18 },
      pageSetup: {
        paperSize: 9,
        orientation: document.columns.length > 6 ? "landscape" : "portrait",
        fitToPage: true,
        fitToWidth: 1,
        fitToHeight: 0,
        horizontalCentered: true,
        margins: { left: 0.4, right: 0.4, top: 0.45, bottom: 0.55, header: 0.2, footer: 0.25 }
      }
    });
    // Keep a second layout column available for the compact label/value summary
    // when an otherwise valid document has only one data column.
    const columnCount = Math.max(2, document.columns.length);
    const titleEnd = titleEndColumn(columnCount);

    worksheet.mergeCells(TITLE_ROW, 1, TITLE_ROW, titleEnd);
    const titleCell = worksheet.getCell(TITLE_ROW, 1);
    titleCell.value = document.title;
    titleCell.font = { bold: true, size: 16, color: { argb: TEXT_COLOR } };
    titleCell.alignment = { horizontal: "left", vertical: "middle", wrapText: true };
    worksheet.getRow(TITLE_ROW).height = 28;

    const metadataValueEnd = Math.max(2, columnCount);
    for (const [offset, [label, value]] of [["Dibuat", document.generatedAt], ["Periode", document.periodLabel]].entries()) {
      const row = METADATA_START_ROW + offset;
      worksheet.getCell(row, 1).value = label;
      worksheet.getCell(row, 1).font = { bold: true, color: { argb: SECONDARY_TEXT_COLOR } };
      worksheet.getCell(row, 1).alignment = { horizontal: "left", vertical: "middle" };
      worksheet.mergeCells(row, 2, row, metadataValueEnd);
      const valueCell = worksheet.getCell(row, 2);
      valueCell.value = value;
      valueCell.font = { color: { argb: TEXT_COLOR } };
      valueCell.alignment = { horizontal: "left", vertical: "middle", wrapText: true };
    }
    worksheet.getRow(4).height = 8;

    let tableHeaderRowNumber = SUMMARY_HEADING_ROW;
    if (document.summary.length) {
      const summaryEnd = Math.min(columnCount, 5);
      const summaryValueStart = Math.max(2, Math.ceil(summaryEnd * 0.65));
      const summaryLabelEnd = Math.max(1, summaryValueStart - 1);
      worksheet.mergeCells(SUMMARY_HEADING_ROW, 1, SUMMARY_HEADING_ROW, summaryEnd);
      const summaryHeading = worksheet.getCell(SUMMARY_HEADING_ROW, 1);
      summaryHeading.value = "Ringkasan";
      summaryHeading.font = { bold: true, size: 10, color: { argb: TEXT_COLOR } };
      summaryHeading.alignment = { horizontal: "left", vertical: "middle" };

      document.summary.forEach((item, index) => {
        const rowNumber = SUMMARY_HEADING_ROW + 1 + index;
        worksheet.mergeCells(rowNumber, 1, rowNumber, summaryLabelEnd);
        worksheet.mergeCells(rowNumber, summaryValueStart, rowNumber, summaryEnd);
        const labelCell = worksheet.getCell(rowNumber, 1);
        labelCell.value = item.label;
        labelCell.font = { color: { argb: SECONDARY_TEXT_COLOR } };
        labelCell.alignment = { horizontal: "left", vertical: "middle", wrapText: true };
        const valueCell = worksheet.getCell(rowNumber, summaryValueStart);
        valueCell.value = item.value;
        valueCell.font = { bold: true, color: { argb: TEXT_COLOR } };
        valueCell.alignment = { horizontal: "right", vertical: "middle", wrapText: true };
        applyBottomBorder(worksheet.getRow(rowNumber), summaryEnd, "hair");
      });
      tableHeaderRowNumber = SUMMARY_HEADING_ROW + document.summary.length + 2;
      worksheet.getRow(tableHeaderRowNumber - 1).height = 8;
    }

    const headerRow = worksheet.getRow(tableHeaderRowNumber);
    document.columns.forEach((column, index) => {
      const cell = headerRow.getCell(index + 1);
      cell.value = column.label;
      cell.font = { bold: true, color: { argb: TEXT_COLOR } };
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: HEADER_FILL } };
      cell.alignment = { horizontal: "left", vertical: "middle", wrapText: true };
    });
    headerRow.height = 28;
    applyBottomBorder(headerRow, columnCount);

    for (const item of document.rows) {
      const row = worksheet.addRow(document.columns.map((column) => item[String(column.key)] ?? ""));
      row.eachCell((cell, columnNumber) => {
        const key = String(document.columns[columnNumber - 1]?.key ?? "");
        const value = typeof cell.value === "string" ? cell.value : "";
        cell.alignment = { horizontal: horizontalAlignment(key, value), vertical: "top", wrapText: true };
      });
      applyBottomBorder(row, columnCount, "hair");
    }

    document.columns.forEach((column, index) => {
      worksheet.getColumn(index + 1).width = columnWidth(document, String(column.key), column.label);
    });

    const frozenColumns = document.columns.length > 6 ? Math.min(2, document.columns.length) : 0;
    worksheet.views = [{
      state: "frozen",
      xSplit: frozenColumns,
      ySplit: tableHeaderRowNumber,
      topLeftCell: worksheet.getCell(tableHeaderRowNumber + 1, frozenColumns + 1).address,
      showGridLines: false
    }];
    if (document.columns.length) {
      worksheet.autoFilter = {
        from: { row: tableHeaderRowNumber, column: 1 },
        to: { row: tableHeaderRowNumber + document.rows.length, column: document.columns.length }
      };
    }
    worksheet.pageSetup.printArea = `A1:${columnLetter(columnCount)}${tableHeaderRowNumber + document.rows.length}`;
    worksheet.pageSetup.printTitlesRow = `${tableHeaderRowNumber}:${tableHeaderRowNumber}`;
    worksheet.headerFooter.oddFooter = `&L${document.title}&RHalaman &P dari &N`;

    const buffer = await workbook.xlsx.writeBuffer();
    return new Uint8Array(buffer);
  }
};
