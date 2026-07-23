import PDFDocument from "pdfkit";
import type { ExportAdapter, ExportDocument } from "@/exports/types";

const PAGE_OPTIONS = {
  size: "A4" as const,
  layout: "landscape" as const,
  margins: { top: 32, right: 32, bottom: 38, left: 32 }
};
const TABLE_FONT_SIZE = 6.5;
const TABLE_LINE_HEIGHT = 8;
const CELL_PADDING = 3;
const HEADER_FILL = "#1F4E78";
const BORDER_COLOR = "#B8C2CC";
const TEXT_COLOR = "#17212B";

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
    const values = document.rows.map((row) => row[String(column.key)] ?? "");
    const longest = Math.max(column.label.length, ...values.map((value) => Math.min(Array.from(value).length, 28)));
    return Math.max(6, Math.min(18, longest));
  });
  const totalWeight = weights.reduce((total, weight) => total + weight, 0) || 1;
  return weights.map((weight) => availableWidth * weight / totalWeight);
}

function renderReportHeading(document: PDFKit.PDFDocument, exportDocument: ExportDocument) {
  document
    .fillColor(TEXT_COLOR)
    .font("Helvetica-Bold")
    .fontSize(16)
    .text(printableText(exportDocument.title), { lineBreak: false });
  document.moveDown(0.45);
  document.font("Helvetica").fontSize(9);
  document.text(`Dibuat: ${printableText(exportDocument.generatedAt)}`);
  document.text(`Periode: ${printableText(exportDocument.periodLabel)}`);
  document.moveDown(0.65);

  if (exportDocument.summary.length) {
    const startX = document.x;
    const startY = document.y;
    const gap = 18;
    const width = (document.page.width - PAGE_OPTIONS.margins.left - PAGE_OPTIONS.margins.right - gap) / 2;
    exportDocument.summary.forEach((item, index) => {
      const column = index % 2;
      const row = Math.floor(index / 2);
      const x = startX + column * (width + gap);
      const y = startY + row * 14;
      document.font("Helvetica-Bold").text(`${printableText(item.label)}:`, x, y, { width: width * 0.48, lineBreak: false });
      document.font("Helvetica").text(printableText(item.value), x + width * 0.48, y, { width: width * 0.52, lineBreak: false });
    });
    document.y = startY + Math.ceil(exportDocument.summary.length / 2) * 14 + 8;
  }
}

function renderTableHeader(document: PDFKit.PDFDocument, exportDocument: ExportDocument, widths: ReadonlyArray<number>) {
  const x = PAGE_OPTIONS.margins.left;
  const y = document.y;
  const wrapped = exportDocument.columns.map((column, index) => {
    document.font("Helvetica-Bold").fontSize(TABLE_FONT_SIZE);
    return wrapText(document, column.label, widths[index] - CELL_PADDING * 2);
  });
  const height = Math.max(...wrapped.map((lines) => lines.length), 1) * TABLE_LINE_HEIGHT + CELL_PADDING * 2;
  let cellX = x;
  wrapped.forEach((lines, index) => {
    document.save().fillColor(HEADER_FILL).rect(cellX, y, widths[index], height).fill().restore();
    document.save().lineWidth(0.5).strokeColor(BORDER_COLOR).rect(cellX, y, widths[index], height).stroke().restore();
    document.fillColor("#FFFFFF").font("Helvetica-Bold").fontSize(TABLE_FONT_SIZE);
    lines.forEach((line, lineIndex) => document.text(line, cellX + CELL_PADDING, y + CELL_PADDING + lineIndex * TABLE_LINE_HEIGHT, {
      width: widths[index] - CELL_PADDING * 2,
      lineBreak: false
    }));
    cellX += widths[index];
  });
  document.y = y + height;
}

function addTablePage(document: PDFKit.PDFDocument, exportDocument: ExportDocument, widths: ReadonlyArray<number>) {
  document.addPage(PAGE_OPTIONS);
  document.y = PAGE_OPTIONS.margins.top;
  renderTableHeader(document, exportDocument, widths);
}

function renderRowFragment(document: PDFKit.PDFDocument, widths: ReadonlyArray<number>, row: WrappedRow, offset: number, lineCount: number) {
  const x = PAGE_OPTIONS.margins.left;
  const y = document.y;
  const height = lineCount * TABLE_LINE_HEIGHT + CELL_PADDING * 2;
  let cellX = x;
  row.forEach((lines, index) => {
    document.save().lineWidth(0.5).strokeColor(BORDER_COLOR).rect(cellX, y, widths[index], height).stroke().restore();
    document.fillColor(TEXT_COLOR).font("Helvetica").fontSize(TABLE_FONT_SIZE);
    lines.slice(offset, offset + lineCount).forEach((line, lineIndex) => document.text(
      line,
      cellX + CELL_PADDING,
      y + CELL_PADDING + lineIndex * TABLE_LINE_HEIGHT,
      { width: widths[index] - CELL_PADDING * 2, lineBreak: false }
    ));
    cellX += widths[index];
  });
  document.y = y + height;
}

function renderTableRows(document: PDFKit.PDFDocument, exportDocument: ExportDocument, widths: ReadonlyArray<number>) {
  for (const item of exportDocument.rows) {
    document.font("Helvetica").fontSize(TABLE_FONT_SIZE);
    const row = exportDocument.columns.map((column, index) =>
      wrapText(document, item[String(column.key)] ?? "", widths[index] - CELL_PADDING * 2)
    );
    const totalLines = Math.max(...row.map((lines) => lines.length), 1);
    let offset = 0;
    while (offset < totalLines) {
      const remainingHeight = document.page.height - PAGE_OPTIONS.margins.bottom - document.y;
      const availableLines = Math.floor((remainingHeight - CELL_PADDING * 2) / TABLE_LINE_HEIGHT);
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

function addPageNumbers(document: PDFKit.PDFDocument) {
  const range = document.bufferedPageRange();
  for (let index = 0; index < range.count; index += 1) {
    document.switchToPage(range.start + index);
    const bottomMargin = document.page.margins.bottom;
    document.page.margins.bottom = 0;
    document
      .fillColor("#5B6570")
      .font("Helvetica")
      .fontSize(7)
      .text(
        `Halaman ${index + 1} dari ${range.count}`,
        PAGE_OPTIONS.margins.left,
        document.page.height - PAGE_OPTIONS.margins.bottom + 14,
        { align: "right", width: document.page.width - PAGE_OPTIONS.margins.left - PAGE_OPTIONS.margins.right, lineBreak: false }
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
      addPageNumbers(document);
      document.end();
    });
  }
};
