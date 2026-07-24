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

/**
 * entity 내 record 상태로 해도 되지만, 일단은 UI 내 convert 된 부분을 기반으로 처리해보기
 */

export type RecordStatus = "connected" | "orphaned" | "delete-failed";

export interface RecordUIPresentation {
  id: string;
  /**
   * 녹음 상태
   */
  status: RecordStatus;
  name: string;
  fileSize: string;
  createdAt: string;
  /**
   * 연결되어있다면 연결된 세션 id
   */
  inSession?: string;
}

export type RecordingAction =
  | {
      type: Extract<RecordStatus, "connected">;
      disabled: boolean;
    }
  | {
      type: Extract<RecordStatus, "orphaned">;
      disabled: boolean;
      action: (recordId: string) => Promise<void>;
    }
  | {
      type: Extract<RecordStatus, "delete-failed">;
      disabled: boolean;
      action: (recordId: string) => Promise<void>;
    };

export interface RecordingRowViewModel {
  status: {
    type: RecordStatus;
    label: string;
  };
  action: RecordingAction;
}
