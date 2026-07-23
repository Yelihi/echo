export interface RecordSummaryCardProps {
  count: number;
  title: string;
  children: React.ReactNode;
}

export interface RecordsSummary {
  total: number;
  connected: number;
  failDelete: number;
  orphaned: number;
}

export interface SummaryDataViewProps {
  recordsSummary: RecordsSummary;
}
