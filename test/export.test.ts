import assert from "node:assert/strict";
import { mkdirSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { after, test } from "node:test";
import Database from "better-sqlite3";
import ExcelJS from "exceljs";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";
import { csvExportAdapter } from "../src/exports/csv-adapter";
import { DEFAULT_EXPORT_MAX_ROWS, ExportConfigurationError, loadExportLimits } from "../src/exports/config";
import { createExportCoordinator } from "../src/exports/coordinator";
import { ExportFormatUnavailableError, ExportLimitExceededError, ExportValidationError } from "../src/exports/errors";
import { excelExportAdapter } from "../src/exports/excel-adapter";
import { adminExportFileName, operatorExportFileName } from "../src/exports/filename";
import { enforceExportPreflight, enforceRenderedExportSize } from "../src/exports/guardrails";
import { exportResponse } from "../src/exports/http";
import { pdfExportAdapter } from "../src/exports/pdf-adapter";
import { createExportRegistry, exportRegistry } from "../src/exports/registry";
import { reportDate, rupiah } from "../src/presentation/formatting";
import { reportReadService } from "../src/reports/read-service";
import type { OperatorReportResult } from "../src/reports/types";
import { getPrismaClient } from "../src/persistence/prisma";
import { openDatabase } from "../src/persistence/database.js";
import { createTransactionEngine } from "../src/transactions/service";

const root = resolve(import.meta.dirname, "..");
const temporary = join(tmpdir(), `amanah-cash-export-${crypto.randomUUID()}`);
const databasePath = join(temporary, "export.sqlite");
const source = (path: string) => readFileSync(resolve(root, path), "utf8");
const environment = {
  databaseUrl: `file:${databasePath}`,
  googleClientId: "test-client",
  googleClientSecret: "test-secret",
  nextAuthSecret: "12345678901234567890123456789012",
  nextAuthUrl: "http://localhost:3000",
  production: false,
  developmentAuth: false,
  developmentAdminEmail: null,
  developmentOperatorEmail: null
};
const generatedAt = new Date("2026-07-22T05:00:00.000Z");

mkdirSync(temporary, { recursive: true });
openDatabase({ databasePath, migrationsPath: resolve(root, "migrations") }).close();
const database = new Database(databasePath);
database.pragma("foreign_keys = ON");
database.prepare("INSERT INTO users (id, name, email, role, is_active) VALUES ('admin-export', 'Admin Export', 'admin-export@example.com', 'PLATFORM_ADMIN', 1)").run();
database.prepare("INSERT INTO users (id, name, email, role, is_active) VALUES ('operator-export-1', 'Operator Ekspor Satu', 'export-one@example.com', 'OPERATOR', 1)").run();
database.prepare("INSERT INTO users (id, name, email, role, is_active) VALUES ('operator-export-2', 'Operator Ekspor Dua', 'export-two@example.com', 'OPERATOR', 1)").run();
database.prepare("INSERT INTO students (id, name, operator_id, status, created_at) VALUES ('student-export-1', 'Alya Ekspor', 'operator-export-1', 'ACTIVE', '2026-07-01T01:00:00.000Z')").run();
database.prepare("INSERT INTO students (id, name, operator_id, status, created_at) VALUES ('student-export-2', 'Rahasia Operator Lain', 'operator-export-2', 'ACTIVE', '2026-07-01T01:00:00.000Z')").run();
const engine = createTransactionEngine(database, () => generatedAt);
engine.create({ actorId: "operator-export-1", studentId: "student-export-1", transactionId: "transaction-export-1", commandId: "command-export-1", correlationId: "correlation-export-1", type: "DEPOSIT", amount: "1000", notes: "Catatan, \"khusus\"\nbaris kedua", occurredAt: "2026-07-21T01:00:00.000Z" });
engine.create({ actorId: "operator-export-2", studentId: "student-export-2", transactionId: "transaction-export-secret", commandId: "command-export-secret", correlationId: "correlation-export-secret", type: "DEPOSIT", amount: "9999", notes: "Rahasia finansial", occurredAt: "2026-07-21T02:00:00.000Z" });
database.prepare("INSERT INTO operator_audit (id, operator_id, actor_id, action, summary, created_at) VALUES ('audit-export-admin', 'operator-export-1', 'admin-export', 'UPDATED', 'Profil Operator diperbarui', '2026-07-21T04:00:00.000Z')").run();

after(async () => {
  await getPrismaClient(environment).$disconnect();
  database.close();
  rmSync(temporary, { recursive: true, force: true });
});

function decode(bytes: Uint8Array) {
  return new TextDecoder().decode(bytes);
}

async function loadWorkbook(bytes: Uint8Array) {
  const workbook = new ExcelJS.Workbook();
  const buffer = new Uint8Array(bytes.byteLength);
  buffer.set(bytes);
  await workbook.xlsx.load(buffer.buffer);
  return workbook;
}

function rowWithValues(worksheet: ExcelJS.Worksheet, values: ReadonlyArray<string>) {
  return worksheet.getRows(1, worksheet.rowCount)?.find((row) => values.every((value, index) => row.getCell(index + 1).value === value));
}

function valuesFrom(row: ExcelJS.Row) {
  return Array.isArray(row.values) ? row.values.slice(1) : [];
}

async function loadPdf(bytes: Uint8Array) {
  const data = new Uint8Array(bytes.byteLength);
  data.set(bytes);
  return getDocument({
    data,
    standardFontDataUrl: `${resolve(root, "node_modules/pdfjs-dist/standard_fonts")}/`
  }).promise;
}

async function pdfText(bytes: Uint8Array) {
  const document = await loadPdf(bytes);
  const pages: string[] = [];
  for (let index = 1; index <= document.numPages; index += 1) {
    const content = await (await document.getPage(index)).getTextContent();
    pages.push(content.items.map((item) => "str" in item ? item.str : "").join(" "));
  }
  return { document, pages };
}

function emptyOperatorResult(page: number, pages: number, id: string, total = 2): OperatorReportResult {
  return {
    filters: { period: "ALL", search: "", sort: "occurredAt", direction: "desc", page },
    students: [{ id: "student-1", name: "Alya", status: "ACTIVE" }],
    summary: { deposits: "20", withdrawals: "0", netMovement: "20", transactionCount: 2, activeStudents: 1, periodLabel: "Seluruh periode" },
    items: [{ id, studentId: "student-1", studentName: "Alya", studentStatus: "ACTIVE", type: "DEPOSIT", amount: "10", correctionDirection: null, reason: null, notes: null, occurredAt: "2026-07-21T01:00:00.000Z", updatedAt: "2026-07-21T01:00:00.000Z", operatorName: "Operator", revision: 1, balanceAfter: "10", auditId: `audit-${id}` }],
    total,
    page,
    pages
  };
}

test("export registry exposes and resolves CSV, Excel, and PDF adapters", () => {
  assert.deepEqual(exportRegistry.formats(), [
    { format: "csv", label: "CSV", implemented: true },
    { format: "xlsx", label: "Excel", implemented: true },
    { format: "pdf", label: "PDF", implemented: true }
  ]);
  assert.deepEqual(exportRegistry.availableFormats().map((item) => item.format), ["csv", "xlsx", "pdf"]);
  assert.throws(() => exportRegistry.resolve("zip"), ExportValidationError);
  assert.equal(exportRegistry.resolve("xlsx").adapter, excelExportAdapter);
  assert.equal(exportRegistry.resolve("pdf").adapter, pdfExportAdapter);
});

test("export limits use centralized defaults and validate environment overrides", () => {
  assert.deepEqual(loadExportLimits({}), { maxRows: DEFAULT_EXPORT_MAX_ROWS, maxBytes: null });
  assert.deepEqual(loadExportLimits({ EXPORT_MAX_ROWS: "2500", EXPORT_MAX_BYTES: "1048576" }), { maxRows: 2500, maxBytes: 1_048_576 });
  assert.throws(() => loadExportLimits({ EXPORT_MAX_ROWS: "0" }), ExportConfigurationError);
  for (const value of ["0", "-1", "not-a-number"]) {
    assert.throws(() => loadExportLimits({ EXPORT_MAX_BYTES: value }), ExportConfigurationError);
  }
});

test("EXPORT_MAX_ROWS permits limit-1 and limit but rejects limit+1", () => {
  const limits = loadExportLimits({ EXPORT_MAX_ROWS: "100" });
  const sampleDocument = {
    title: "Laporan",
    generatedAt: "23 Jul 2026, 12.00",
    periodLabel: "Seluruh periode",
    summary: [],
    columns: [{ key: "value", label: "Nilai" }],
    rows: [{ value: "Baris contoh" }]
  };

  assert.doesNotThrow(() => enforceExportPreflight({ limits, sampleDocument, totalRows: 99 }));
  assert.doesNotThrow(() => enforceExportPreflight({ limits, sampleDocument, totalRows: 100 }));
  assert.throws(() => enforceExportPreflight({ limits, sampleDocument, totalRows: 101 }), ExportLimitExceededError);
});

test("CSV adapter emits UTF-8, RFC-style escaping, and spreadsheet-safe user text", async () => {
  const bytes = await csvExportAdapter.render({
    title: "Laporan UTF-8",
    generatedAt: "22 Jul 2026, 12.00",
    periodLabel: "Seluruh periode",
    summary: [],
    columns: [{ key: "value", label: "Nilai" }],
    rows: [{ value: "=2+2, \"uji\"\nbaris" }]
  });
  const content = decode(bytes);
  assert.deepEqual([...bytes.slice(0, 3)], [0xef, 0xbb, 0xbf]);
  assert.match(content, /"'=2\+2, ""uji""\nbaris"/);
  assert.equal(content.endsWith("\r\n"), true);
});

test("Excel adapter creates one formatted Laporan worksheet from the Export Document", async () => {
  const bytes = await excelExportAdapter.render({
    title: "Laporan Keuangan",
    generatedAt: "22 Jul 2026, 12.00",
    periodLabel: "Juli 2026",
    summary: [{ label: "Total setoran", value: "Rp 1.000" }],
    columns: [{ key: "occurredAt", label: "Waktu" }, { key: "student", label: "Siswa" }, { key: "amount", label: "Jumlah" }],
    rows: [
      { occurredAt: "21 Jul 2026, 08.00", student: "Alya", amount: "+ Rp 1.000" },
      { occurredAt: "22 Jul 2026, 09.30", student: "Bima", amount: "− Rp 500" }
    ]
  });
  assert.deepEqual([...bytes.slice(0, 2)], [0x50, 0x4b]);
  assert.equal(excelExportAdapter.mediaType, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  assert.equal(excelExportAdapter.fileExtension, "xlsx");

  const workbook = await loadWorkbook(bytes);
  assert.deepEqual(workbook.worksheets.map((worksheet) => worksheet.name), ["Laporan"]);
  const worksheet = workbook.getWorksheet("Laporan")!;
  const header = rowWithValues(worksheet, ["Waktu", "Siswa", "Jumlah"]);
  assert.ok(header);
  assert.equal(header.number, 1);
  assert.equal(header.font.bold, true);
  assert.equal(worksheet.views[0]?.state, "frozen");
  assert.equal(worksheet.views[0]?.ySplit, 1);
  assert.ok(worksheet.autoFilter);
  assert.deepEqual(valuesFrom(worksheet.getRow(header.number + 1)).slice(0, 3), ["21 Jul 2026, 08.00", "Alya", "+ Rp 1.000"]);
  assert.deepEqual(valuesFrom(worksheet.getRow(header.number + 2)).slice(0, 3), ["22 Jul 2026, 09.30", "Bima", "− Rp 500"]);
  assert.equal(worksheet.getRow(header.number + 1).getCell(3).alignment.horizontal, "right");
  assert.equal(worksheet.getColumn(1).values.filter(Boolean).length - 1, 2);
  assert.equal(worksheet.getCell(1, 5).value, "Laporan Keuangan");
  assert.equal(worksheet.getCell(5, 5).value, "Total setoran");
  assert.ok(worksheet.columns.slice(0, 3).every((column) => (column.width ?? 0) >= 12 && (column.width ?? 0) <= 40));
});

test("PDF adapter renders metadata, summary, and transaction table from the Export Document", async () => {
  const bytes = await pdfExportAdapter.render({
    title: "Laporan Keuangan",
    generatedAt: "22 Jul 2026, 12.00",
    periodLabel: "Juli 2026",
    summary: [{ label: "Total setoran", value: "Rp 1.000" }],
    columns: [{ key: "occurredAt", label: "Waktu" }, { key: "student", label: "Siswa" }, { key: "amount", label: "Jumlah" }],
    rows: [
      { occurredAt: "21 Jul 2026, 08.00", student: "Alya", amount: "+ Rp 1.000" },
      { occurredAt: "22 Jul 2026, 09.30", student: "Bima", amount: "− Rp 500" }
    ]
  });
  assert.deepEqual(decode(bytes.slice(0, 5)), "%PDF-");
  assert.equal(pdfExportAdapter.mediaType, "application/pdf");
  assert.equal(pdfExportAdapter.fileExtension, "pdf");

  const { document, pages } = await pdfText(bytes);
  const text = pages.join(" ");
  assert.equal(document.numPages, 1);
  assert.match(text, /Laporan Keuangan/);
  assert.match(text, /Dibuat/);
  assert.match(text, /22 Jul 2026, 12.00/);
  assert.match(text, /Periode/);
  assert.match(text, /Juli 2026/);
  assert.match(text, /Ringkasan/);
  assert.match(text, /Total setoran/);
  assert.match(text, /Rp 1.000/);
  assert.match(text, /Waktu/);
  assert.match(text, /Alya/);
  assert.match(text, /Bima/);
  assert.match(text, /Halaman 1 dari 1/);
  assert.equal(((await document.getMetadata()).info as Record<string, unknown>).Title, "Laporan Keuangan");
});

test("PDF adapter paginates long reports and repeats readable table headers", async () => {
  const rows = Array.from({ length: 120 }, (_, index) => ({
    occurredAt: `23 Jul 2026, ${String(index % 24).padStart(2, "0")}.00`,
    student: `Siswa ${index + 1}`,
    notes: `Catatan transaksi ${index + 1}`
  }));
  const bytes = await pdfExportAdapter.render({
    title: "Laporan Multipage",
    generatedAt: "23 Jul 2026, 12.00",
    periodLabel: "Seluruh periode",
    summary: [{ label: "Jumlah transaksi", value: String(rows.length) }],
    columns: [{ key: "occurredAt", label: "Waktu" }, { key: "student", label: "Siswa" }, { key: "notes", label: "Catatan" }],
    rows
  });
  const { document, pages } = await pdfText(bytes);
  assert.ok(document.numPages > 1);
  assert.ok(pages.every((page) => page.includes("Waktu") && page.includes("Siswa") && page.includes("Catatan")));
  assert.match(pages.at(-1) ?? "", /Siswa 120/);
  assert.ok(pages.every((page, index) => page.includes(`Halaman ${index + 1} dari ${document.numPages}`)));
});

test("export coordinator resolves all pages through the existing ownership-scoped reader", async () => {
  const calls: Array<{ operatorId: string; page?: string }> = [];
  const reader = {
    async operator(operatorId: string, query: { page?: string }) {
      calls.push({ operatorId, page: query.page });
      return emptyOperatorResult(Number(query.page), 2, `row-${query.page}`);
    },
    async admin() {
      throw new Error("Admin reader should not be called.");
    }
  };
  const coordinator = createExportCoordinator({ reader, now: () => generatedAt });
  const result = await coordinator.operator({ operatorId: "operator-owned", parameters: new URLSearchParams({ format: "csv", period: "ALL", page: "99" }) });
  assert.deepEqual(calls, [{ operatorId: "operator-owned", page: "1" }, { operatorId: "operator-owned", page: "2" }]);
  const content = decode(result.bytes);
  assert.doesNotMatch(content, /"'\+ Rp/);
  assert.equal(content.match(/"Alya"/g)?.length, 2);
  assert.equal(result.fileName, "laporan-keuangan-semua-periode-20260722-120000.csv");
});

test("export coordinator resolves Excel through the registry with existing filename and guard rails", async () => {
  const calls: string[] = [];
  const reader = {
    async operator(_operatorId: string, query: { page?: string }) {
      calls.push(query.page ?? "");
      return emptyOperatorResult(Number(query.page), 2, `row-${query.page}`);
    },
    async admin() {
      throw new Error("Admin reader should not be called.");
    }
  };
  const coordinator = createExportCoordinator({ reader, limits: { maxRows: 2, maxBytes: null }, now: () => generatedAt });
  const result = await coordinator.operator({ operatorId: "operator-owned", parameters: new URLSearchParams({ format: "xlsx", period: "ALL" }) });
  assert.deepEqual(calls, ["1", "2"]);
  assert.equal(result.mediaType, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  assert.equal(result.fileName, "laporan-keuangan-semua-periode-20260722-120000.xlsx");
  const worksheet = (await loadWorkbook(result.bytes)).getWorksheet("Laporan")!;
  const header = rowWithValues(worksheet, ["Waktu", "Siswa", "Status Siswa", "Jenis"]);
  assert.ok(header);
  assert.equal(worksheet.getColumn(1).values.filter(Boolean).length - 1, 2);
});

test("export coordinator resolves PDF with existing pagination, filename, MIME type, and guard rails", async () => {
  const calls: string[] = [];
  const reader = {
    async operator(_operatorId: string, query: { page?: string }) {
      calls.push(query.page ?? "");
      return emptyOperatorResult(Number(query.page), 2, `row-${query.page}`);
    },
    async admin() {
      throw new Error("Admin reader should not be called.");
    }
  };
  const coordinator = createExportCoordinator({ reader, limits: { maxRows: 2, maxBytes: null }, now: () => generatedAt });
  const result = await coordinator.operator({ operatorId: "operator-owned", parameters: new URLSearchParams({ format: "pdf", period: "ALL" }) });
  assert.deepEqual(calls, ["1", "2"]);
  assert.equal(result.mediaType, "application/pdf");
  assert.equal(result.fileName, "laporan-keuangan-semua-periode-20260722-120000.pdf");
  const { pages } = await pdfText(result.bytes);
  assert.match(pages.join(" "), /Alya/);
  const response = await exportResponse(async () => result);
  assert.equal(response.headers.get("content-type"), "application/pdf");
  assert.equal(response.headers.get("content-disposition"), 'attachment; filename="laporan-keuangan-semua-periode-20260722-120000.pdf"');
});

test("PDF export rejects an oversized report before collecting later pages", async () => {
  const calls: string[] = [];
  const reader = {
    async operator(_operatorId: string, query: { page?: string }) {
      calls.push(query.page ?? "");
      return emptyOperatorResult(1, 6, "row-1", 101);
    },
    async admin() {
      throw new Error("Admin reader should not be called.");
    }
  };
  const coordinator = createExportCoordinator({ reader, limits: { maxRows: 100, maxBytes: null }, now: () => generatedAt });
  await assert.rejects(
    coordinator.operator({ operatorId: "operator-owned", parameters: new URLSearchParams({ format: "pdf", period: "ALL" }) }),
    ExportLimitExceededError
  );
  assert.deepEqual(calls, ["1"]);
});

test("Excel export rejects an oversized report before collecting later pages", async () => {
  const calls: string[] = [];
  const reader = {
    async operator(_operatorId: string, query: { page?: string }) {
      calls.push(query.page ?? "");
      return emptyOperatorResult(1, 6, "row-1", 101);
    },
    async admin() {
      throw new Error("Admin reader should not be called.");
    }
  };
  const coordinator = createExportCoordinator({ reader, limits: { maxRows: 100, maxBytes: null }, now: () => generatedAt });
  await assert.rejects(
    coordinator.operator({ operatorId: "operator-owned", parameters: new URLSearchParams({ format: "xlsx", period: "ALL" }) }),
    ExportLimitExceededError
  );
  assert.deepEqual(calls, ["1"]);
});

test("export coordinator rejects oversized reports after preflight without collecting later pages", async () => {
  const calls: string[] = [];
  const reader = {
    async operator(_operatorId: string, query: { page?: string }) {
      calls.push(query.page ?? "");
      return emptyOperatorResult(1, 6, "row-1", 101);
    },
    async admin() {
      throw new Error("Admin reader should not be called.");
    }
  };
  const coordinator = createExportCoordinator({ reader, limits: { maxRows: 100, maxBytes: null }, now: () => generatedAt });
  await assert.rejects(
    coordinator.operator({ operatorId: "operator-owned", parameters: new URLSearchParams({ format: "csv", period: "ALL" }) }),
    ExportLimitExceededError
  );
  assert.deepEqual(calls, ["1"]);
});

test("optional export byte limit rejects from first-page estimate and enforces rendered bytes", async () => {
  let renderCalls = 0;
  const registry = createExportRegistry([["csv", {
    mediaType: "text/csv; charset=utf-8",
    fileExtension: "csv",
    async render() {
      renderCalls += 1;
      return new Uint8Array(10);
    }
  }]]);
  const reader = {
    async operator(_operatorId: string, query: { page?: string }) {
      return emptyOperatorResult(Number(query.page), 2, `row-${query.page}`);
    },
    async admin() {
      throw new Error("Admin reader should not be called.");
    }
  };
  const coordinator = createExportCoordinator({ reader, registry, limits: { maxRows: 100, maxBytes: 1 }, now: () => generatedAt });
  await assert.rejects(
    coordinator.operator({ operatorId: "operator-owned", parameters: new URLSearchParams({ format: "csv" }) }),
    ExportLimitExceededError
  );
  assert.equal(renderCalls, 0);
  assert.throws(() => enforceRenderedExportSize(11, { maxRows: 100, maxBytes: 10 }), ExportLimitExceededError);
});

test("filenames are Jakarta-based, meaningful, collision-resistant, and privacy-safe", () => {
  const report = emptyOperatorResult(1, 1, "row-1");
  report.filters = { ...report.filters, period: "MONTH", dateFrom: "2026-07-01", dateTo: "2026-07-22", studentId: "student-secret" };
  assert.equal(operatorExportFileName(report.filters, generatedAt, "csv"), "laporan-keuangan-2026-07-20260722-120000.csv");
  assert.equal(adminExportFileName({
    query: { kind: "OPERATOR_ACTIVITY", period: "MONTH", search: "", dateFrom: "2026-07-01", dateTo: "2026-07-22" },
    periodLabel: "Jul 2026",
    items: [],
    total: 0,
    page: 1,
    pages: 1
  }, generatedAt, "csv"), "laporan-administratif-aktivitas-operator-2026-07-20260722-120000.csv");
  assert.doesNotMatch(operatorExportFileName(report.filters, generatedAt, "csv"), /student-secret|Alya|Operator/);
});

test("export HTTP responses are private attachments and map controlled export failures", async () => {
  const success = await exportResponse(async () => ({ bytes: new TextEncoder().encode("csv"), fileName: "laporan.csv", format: "csv", mediaType: "text/csv; charset=utf-8" }));
  assert.equal(success.status, 200);
  assert.equal(success.headers.get("content-disposition"), 'attachment; filename="laporan.csv"');
  assert.equal(success.headers.get("cache-control"), "private, no-store");
  assert.equal(success.headers.get("x-content-type-options"), "nosniff");
  assert.equal(await success.text(), "csv");

  const failure = await exportResponse(async () => { throw new ExportFormatUnavailableError(); });
  assert.equal(failure.status, 501);
  assert.deepEqual(await failure.json(), { error: { code: "EXPORT_FORMAT_UNAVAILABLE", message: "Format ekspor belum tersedia." } });

  const oversized = await exportResponse(async () => { throw new ExportLimitExceededError(); });
  assert.equal(oversized.status, 413);
  assert.equal(oversized.headers.get("cache-control"), "no-store");
  assert.deepEqual(await oversized.json(), {
    error: {
      code: "EXPORT_LIMIT_EXCEEDED",
      message: "Data laporan terlalu besar untuk diekspor. Persempit periode atau filter, lalu coba lagi."
    }
  });
});

test("Operator CSV matches Reporting formatting and excludes another Operator and hidden identifiers", async () => {
  const coordinator = createExportCoordinator({ reader: reportReadService(environment, () => generatedAt), now: () => generatedAt });
  const result = await coordinator.operator({ operatorId: "operator-export-1", parameters: new URLSearchParams({ format: "csv", period: "ALL" }) });
  const content = decode(result.bytes);
  assert.equal(result.mediaType, "text/csv; charset=utf-8");
  assert.match(content, new RegExp(rupiah("1000").replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  assert.match(content, new RegExp(reportDate("2026-07-21T01:00:00.000Z").replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  assert.match(content, /Catatan, ""khusus""\nbaris kedua/);
  assert.doesNotMatch(content, /Rahasia Operator Lain|Rahasia finansial/);
  assert.doesNotMatch(content, /transaction-export-1|student-export-1|command-export/);
});

test("Admin CSV remains administrative and contains no financial report fields", async () => {
  const coordinator = createExportCoordinator({ reader: reportReadService(environment, () => generatedAt), now: () => generatedAt });
  const result = await coordinator.admin({ parameters: new URLSearchParams({ format: "csv", period: "ALL", kind: "OPERATOR_ACTIVITY" }) });
  const content = decode(result.bytes);
  assert.equal(result.fileName, "laporan-administratif-aktivitas-operator-semua-periode-20260722-120000.csv");
  assert.match(content, /Profil Operator diperbarui/);
  assert.doesNotMatch(content, /Saldo setelah|Total setoran|Total penarikan|Pergerakan bersih|transaction-export|9999/);
});

test("export endpoints reuse centralized role authorization and UI exposes registry-backed downloads", () => {
  const operatorRoute = source("src/app/api/operator/reports/export/route.ts");
  const adminRoute = source("src/app/api/admin/reports/export/route.ts");
  const coordinator = source("src/exports/coordinator.ts");
  const components = source("src/components/reports/report-components.tsx");
  assert.match(operatorRoute, /withAuthorization\(\{ role: "operator" \}/);
  assert.match(operatorRoute, /authorization\.id/);
  assert.match(adminRoute, /withAuthorization\(\{ role: "admin" \}/);
  assert.doesNotMatch(`${operatorRoute}${adminRoute}${coordinator}`, /Prisma|prisma|transactionEngine|effect\(/);
  assert.match(coordinator, /reader\.operator/);
  assert.match(coordinator, /reader\.admin/);
  assert.match(components, /exportRegistry\.availableFormats\(\)/);
  assert.match(components, /Unduh \{item\.label\}/);
  assert.doesNotMatch(components, /Unduh Excel|Unduh PDF/);
  assert.match(source("src/reports/export-contract.ts"), /interface ReportExportAdapter/);
});
