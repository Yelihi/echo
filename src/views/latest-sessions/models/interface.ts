import type { GetLatestStudySession } from "@/widgets/latest-sessions/models/studySession";
import type { HistoryQuery, HistorySearchParams } from "@/widgets/latest-sessions/models/history";

export interface LatestSessionsViewProps {
  sessions?: readonly GetLatestStudySession[];
  query?: HistoryQuery;
  totalCount?: number;
  totalPages?: number;
}
export interface HistoryFiltersProps {
  query: HistoryQuery;
}
export interface SessionsPageProps {
  searchParams: Promise<HistorySearchParams>;
}

export interface HistoryErrorProps {
  reset: () => void;
}

export interface HistoryToolbarProps extends HistoryFiltersProps {
  totalCount: number;
}
export interface HistoryEmptyStateProps {
  filtered: boolean;
}
export interface HistoryFilterControlsProps extends HistoryFiltersProps {
  pending?: boolean;
  onChange: (changes: Partial<Pick<HistoryQuery, "status" | "sort">>) => void;
}
