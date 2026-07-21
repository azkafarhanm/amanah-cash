export type ReportExportColumn<TRow> = {
  key: keyof TRow;
  label: string;
};

export type ReportExportDocument<TSummary, TRow> = {
  title: string;
  generatedAt: string;
  periodLabel: string;
  summary: TSummary;
  columns: ReadonlyArray<ReportExportColumn<TRow>>;
  rows: ReadonlyArray<TRow>;
};

export interface ReportExportAdapter<TSummary, TRow> {
  readonly mediaType: string;
  readonly fileExtension: string;
  render(document: ReportExportDocument<TSummary, TRow>): Promise<Uint8Array>;
}
