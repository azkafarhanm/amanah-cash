import PDFDocument from "pdfkit/js/pdfkit.standalone.js";
import type { ExportAdapter, ExportDocument } from "@/exports/types";

const PAGE_OPTIONS = {
  size: "A4" as const,
  layout: "landscape" as const,
  margins: { top: 34, right: 34, bottom: 46, left: 34 }
};
const TITLE_FONT_SIZE = 16;
const METADATA_FONT_SIZE = 9;
const SUMMARY_LABEL_FONT_SIZE = 9;
const SUMMARY_VALUE_FONT_SIZE = 11;
const TABLE_HEADER_FONT_SIZE = 9;
const TABLE_BODY_FONT_SIZE = 8;
const TABLE_HEADER_LINE_HEIGHT = 11;
const TABLE_BODY_LINE_HEIGHT = 10;
const CELL_PADDING = 4;
const BRANDING_RESERVATION_WIDTH = 76;
const HEADING_CONTENT_GAP = 12;
const CONTINUATION_HEADING_HEIGHT = 28;
const HEADER_FILL = "#F1F2F3";
const BORDER_COLOR = "#C9CDD1";
const TEXT_COLOR = "#202428";
const SECONDARY_TEXT_COLOR = "#555C63";
const SUMMARY_HEADING_FONT_SIZE = 10;
const SUMMARY_ROW_HEIGHT = 18;

const COLUMN_WEIGHTS: Readonly<Record<string, number>> = {
  occurredAt: 13,
  student: 18,
  studentStatus: 10,
  type: 9,
  correctionDirection: 10,
  amount: 13,
  balanceAfter: 15,
  notes: 20,
  reason: 18,
  revision: 9,
  updatedAt: 13,
  operator: 15,
  auditReference: 15,
  category: 13,
  subject: 20,
  description: 30
};

type WrappedRow = ReadonlyArray<ReadonlyArray<string>>;

function printableText(value: string) {
  return value
    .replaceAll("\u2212", "-")
    .replace(/\r\n?/g, "\n")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "");
}

function wrapLine(document: PDFKit.PDFDocument, value: string, width: number) {
  const lines: string[] = [];
  let current = "";

  const pushToken = (token: string) => {
    const candidate = current ? `${current} ${token}` : token;
    if (document.widthOfString(candidate) <= width) {
      current = candidate;
      return;
    }
    if (current) {
      lines.push(current);
      current = "";
    }
    let fragment = "";
    for (const character of Array.from(token)) {
      if (fragment && document.widthOfString(`${fragment}${character}`) > width) {
        lines.push(fragment);
        fragment = character;
      } else {
        fragment += character;
      }
    }
    current = fragment;
  };

  for (const token of value.split(/\s+/).filter(Boolean)) pushToken(token);
  lines.push(current);
  return lines;
}

function wrapText(document: PDFKit.PDFDocument, value: string, width: number) {
  const lines = printableText(value).split("\n").flatMap((line) => wrapLine(document, line, width));
  return lines.length ? lines : [""];
}

function columnWidths(document: ExportDocument, availableWidth: number) {
  const weights = document.columns.map((column) => {
    const presentationWeight = COLUMN_WEIGHTS[String(column.key)];
    if (presentationWeight) return presentationWeight;
    const values = document.rows.map((row) => row[String(column.key)] ?? "");
    const longest = Math.max(column.label.length, ...values.map((value) => Math.min(Array.from(value).length, 28)));
    return Math.max(9, Math.min(20, longest));
  });
  const totalWeight = weights.reduce((total, weight) => total + weight, 0) || 1;
  return weights.map((weight) => availableWidth * weight / totalWeight);
}

function renderReportHeading(document: PDFKit.PDFDocument, exportDocument: ExportDocument) {
  const availableWidth = document.page.width - PAGE_OPTIONS.margins.left - PAGE_OPTIONS.margins.right;
  const headingWidth = availableWidth - BRANDING_RESERVATION_WIDTH - HEADING_CONTENT_GAP;
  const startY = document.y;
  const metadataLabelWidth = 52;
  const metadataValueX = PAGE_OPTIONS.margins.left + metadataLabelWidth + 8;
  const metadataValueWidth = headingWidth - metadataLabelWidth - 8;

  document
    .fillColor(TEXT_COLOR)
    .font("Helvetica-Bold")
    .fontSize(TITLE_FONT_SIZE)
    .text(printableText(exportDocument.title), PAGE_OPTIONS.margins.left, startY, {
      width: headingWidth,
      lineBreak: false,
      ellipsis: true
    });
  document
    .fillColor(SECONDARY_TEXT_COLOR)
    .font("Helvetica-Bold")
    .fontSize(METADATA_FONT_SIZE)
    .text("Dibuat", PAGE_OPTIONS.margins.left, startY + 25, {
      width: metadataLabelWidth,
      lineBreak: false,
      ellipsis: true
    })
    .text("Periode", PAGE_OPTIONS.margins.left, startY + 40, {
      width: metadataLabelWidth,
      lineBreak: false,
      ellipsis: true
    });
  document
    .fillColor(TEXT_COLOR)
    .font("Helvetica")
    .fontSize(METADATA_FONT_SIZE)
    .text(`: ${printableText(exportDocument.generatedAt)}`, metadataValueX, startY + 25, {
      width: metadataValueWidth,
      lineBreak: false,
      ellipsis: true
    })
    .text(`: ${printableText(exportDocument.periodLabel)}`, metadataValueX, startY + 40, {
      width: metadataValueWidth,
      lineBreak: false,
      ellipsis: true
    });
  document.y = startY + 68;

  if (exportDocument.summary.length) {
    const summaryWidth = Math.min(370, availableWidth * 0.56);
    const summaryX = PAGE_OPTIONS.margins.left + (availableWidth - summaryWidth) / 2;
    const summaryStartY = document.y;
    const summaryValueWidth = Math.min(148, summaryWidth * 0.42);
    const summaryLabelWidth = summaryWidth - summaryValueWidth - 16;

    document
      .fillColor(TEXT_COLOR)
      .font("Helvetica-Bold")
      .fontSize(SUMMARY_HEADING_FONT_SIZE)
      .text("Ringkasan", summaryX, summaryStartY, { width: summaryWidth, lineBreak: false });

    exportDocument.summary.forEach((item, index) => {
      const y = summaryStartY + 19 + index * SUMMARY_ROW_HEIGHT;
      document
        .fillColor(SECONDARY_TEXT_COLOR)
        .font("Helvetica")
        .fontSize(SUMMARY_LABEL_FONT_SIZE)
        .text(printableText(item.label), summaryX, y, { width: summaryLabelWidth, lineBreak: false, ellipsis: true });
      document
        .fillColor(TEXT_COLOR)
        .font("Helvetica-Bold")
        .fontSize(SUMMARY_VALUE_FONT_SIZE)
        .text(printableText(item.value), summaryX + summaryLabelWidth + 16, y - 1, {
          width: summaryValueWidth,
          align: "right",
          lineBreak: false,
          ellipsis: true
        });
      document
        .save()
        .lineWidth(0.3)
        .strokeColor(BORDER_COLOR)
        .moveTo(summaryX, y + 14)
        .lineTo(summaryX + summaryWidth, y + 14)
        .stroke()
        .restore();
    });
    document.y = summaryStartY + 19 + exportDocument.summary.length * SUMMARY_ROW_HEIGHT + 17;
  }
}

function tableHeaderHeight(document: PDFKit.PDFDocument, exportDocument: ExportDocument, widths: ReadonlyArray<number>) {
  document.font("Helvetica-Bold").fontSize(TABLE_HEADER_FONT_SIZE);
  const lineCount = Math.max(
    ...exportDocument.columns.map((column, index) =>
      wrapText(document, column.label, widths[index] - CELL_PADDING * 2).length
    ),
    1
  );
  return lineCount * TABLE_HEADER_LINE_HEIGHT + CELL_PADDING * 2;
}

function renderTableHeader(document: PDFKit.PDFDocument, exportDocument: ExportDocument, widths: ReadonlyArray<number>) {
  const x = PAGE_OPTIONS.margins.left;
  const y = document.y;
  const wrapped = exportDocument.columns.map((column, index) => {
    document.font("Helvetica-Bold").fontSize(TABLE_HEADER_FONT_SIZE);
    return wrapText(document, column.label, widths[index] - CELL_PADDING * 2);
  });
  const height = tableHeaderHeight(document, exportDocument, widths);
  const tableWidth = widths.reduce((total, width) => total + width, 0);

  document.save().fillColor(HEADER_FILL).rect(x, y, tableWidth, height).fill().restore();
  document
    .save()
    .lineWidth(0.6)
    .strokeColor(BORDER_COLOR)
    .moveTo(x, y)
    .lineTo(x + tableWidth, y)
    .moveTo(x, y + height)
    .lineTo(x + tableWidth, y + height)
    .stroke()
    .restore();

  let cellX = x;
  wrapped.forEach((lines, index) => {
    document.fillColor(TEXT_COLOR).font("Helvetica-Bold").fontSize(TABLE_HEADER_FONT_SIZE);
    lines.forEach((line, lineIndex) => document.text(line, cellX + CELL_PADDING, y + CELL_PADDING + lineIndex * TABLE_HEADER_LINE_HEIGHT, {
      width: widths[index] - CELL_PADDING * 2,
      lineBreak: false
    }));
    cellX += widths[index];
  });
  document.y = y + height;
}

function renderContinuationHeading(document: PDFKit.PDFDocument, exportDocument: ExportDocument) {
  const availableWidth = document.page.width - PAGE_OPTIONS.margins.left - PAGE_OPTIONS.margins.right;
  const y = PAGE_OPTIONS.margins.top;
  document
    .fillColor(TEXT_COLOR)
    .font("Helvetica-Bold")
    .fontSize(9)
    .text(printableText(exportDocument.title), PAGE_OPTIONS.margins.left, y, {
      width: availableWidth * 0.62,
      lineBreak: false,
      ellipsis: true
    });
  document
    .fillColor(SECONDARY_TEXT_COLOR)
    .font("Helvetica")
    .fontSize(8)
    .text(`Periode: ${printableText(exportDocument.periodLabel)}`, PAGE_OPTIONS.margins.left + availableWidth * 0.62, y + 1, {
      width: availableWidth * 0.38,
      align: "right",
      lineBreak: false,
      ellipsis: true
    });
  document
    .save()
    .lineWidth(0.5)
    .strokeColor(BORDER_COLOR)
    .moveTo(PAGE_OPTIONS.margins.left, y + 17)
    .lineTo(document.page.width - PAGE_OPTIONS.margins.right, y + 17)
    .stroke()
    .restore();
  document.y = y + CONTINUATION_HEADING_HEIGHT;
}

function addTablePage(document: PDFKit.PDFDocument, exportDocument: ExportDocument, widths: ReadonlyArray<number>) {
  document.addPage(PAGE_OPTIONS);
  renderContinuationHeading(document, exportDocument);
  renderTableHeader(document, exportDocument, widths);
}

function renderRowFragment(document: PDFKit.PDFDocument, widths: ReadonlyArray<number>, row: WrappedRow, offset: number, lineCount: number) {
  const x = PAGE_OPTIONS.margins.left;
  const y = document.y;
  const height = lineCount * TABLE_BODY_LINE_HEIGHT + CELL_PADDING * 2;
  const tableWidth = widths.reduce((total, width) => total + width, 0);
  let cellX = x;
  row.forEach((lines, index) => {
    document.fillColor(TEXT_COLOR).font("Helvetica").fontSize(TABLE_BODY_FONT_SIZE);
    lines.slice(offset, offset + lineCount).forEach((line, lineIndex) => document.text(
      line,
      cellX + CELL_PADDING,
      y + CELL_PADDING + lineIndex * TABLE_BODY_LINE_HEIGHT,
      { width: widths[index] - CELL_PADDING * 2, lineBreak: false }
    ));
    cellX += widths[index];
  });
  document
    .save()
    .lineWidth(0.4)
    .strokeColor(BORDER_COLOR)
    .moveTo(x, y + height)
    .lineTo(x + tableWidth, y + height)
    .stroke()
    .restore();
  document.y = y + height;
}

function renderTableRows(document: PDFKit.PDFDocument, exportDocument: ExportDocument, widths: ReadonlyArray<number>) {
  const pageBottom = () => document.page.height - PAGE_OPTIONS.margins.bottom;
  const freshPageCapacity = document.page.height
    - PAGE_OPTIONS.margins.bottom
    - PAGE_OPTIONS.margins.top
    - CONTINUATION_HEADING_HEIGHT
    - tableHeaderHeight(document, exportDocument, widths);

  for (const item of exportDocument.rows) {
    document.font("Helvetica").fontSize(TABLE_BODY_FONT_SIZE);
    const row = exportDocument.columns.map((column, index) =>
      wrapText(document, item[String(column.key)] ?? "", widths[index] - CELL_PADDING * 2)
    );
    const totalLines = Math.max(...row.map((lines) => lines.length), 1);
    const totalHeight = totalLines * TABLE_BODY_LINE_HEIGHT + CELL_PADDING * 2;

    if (totalHeight > pageBottom() - document.y && totalHeight <= freshPageCapacity) {
      addTablePage(document, exportDocument, widths);
    }

    let offset = 0;
    while (offset < totalLines) {
      const remainingHeight = pageBottom() - document.y;
      const availableLines = Math.floor((remainingHeight - CELL_PADDING * 2) / TABLE_BODY_LINE_HEIGHT);
      if (availableLines < 1) {
        addTablePage(document, exportDocument, widths);
        continue;
      }
      const lineCount = Math.min(totalLines - offset, availableLines);
      renderRowFragment(document, widths, row, offset, lineCount);
      offset += lineCount;
      if (offset < totalLines) addTablePage(document, exportDocument, widths);
    }
  }
}

function addPageFooters(document: PDFKit.PDFDocument, exportDocument: ExportDocument) {
  const range = document.bufferedPageRange();
  const footerY = document.page.height - PAGE_OPTIONS.margins.bottom + 17;
  const availableWidth = document.page.width - PAGE_OPTIONS.margins.left - PAGE_OPTIONS.margins.right;

  for (let index = 0; index < range.count; index += 1) {
    document.switchToPage(range.start + index);
    const bottomMargin = document.page.margins.bottom;
    document.page.margins.bottom = 0;
    document
      .fillColor(SECONDARY_TEXT_COLOR)
      .font("Helvetica")
      .fontSize(8)
      .text(
        printableText(exportDocument.title),
        PAGE_OPTIONS.margins.left,
        footerY,
        { width: availableWidth * 0.64, lineBreak: false, ellipsis: true }
      )
      .text(
        `Halaman ${index + 1} dari ${range.count}`,
        PAGE_OPTIONS.margins.left + availableWidth * 0.64,
        footerY,
        { align: "right", width: availableWidth * 0.36, lineBreak: false }
      );
    document.page.margins.bottom = bottomMargin;
  }
}

export const pdfExportAdapter: ExportAdapter = {
  mediaType: "application/pdf",
  fileExtension: "pdf",
  async render(exportDocument) {
    return new Promise<Uint8Array>((resolve, reject) => {
      const document = new PDFDocument({
        autoFirstPage: false,
        bufferPages: true,
        compress: true,
        info: {
          Title: printableText(exportDocument.title),
          Author: "Amanah Cash",
          Creator: "Amanah Cash",
          Subject: printableText(exportDocument.periodLabel)
        }
      });
      const chunks: Uint8Array[] = [];
      document.on("data", (chunk: Uint8Array) => chunks.push(chunk));
      document.on("error", reject);
      document.on("end", () => {
        const length = chunks.reduce((total, chunk) => total + chunk.byteLength, 0);
        const bytes = new Uint8Array(length);
        let offset = 0;
        for (const chunk of chunks) {
          bytes.set(chunk, offset);
          offset += chunk.byteLength;
        }
        resolve(bytes);
      });

      document.addPage(PAGE_OPTIONS);
      renderReportHeading(document, exportDocument);
      const widths = columnWidths(exportDocument, document.page.width - PAGE_OPTIONS.margins.left - PAGE_OPTIONS.margins.right);
      renderTableHeader(document, exportDocument, widths);
      renderTableRows(document, exportDocument, widths);
      addPageFooters(document, exportDocument);
      document.end();
    });
  }
};
