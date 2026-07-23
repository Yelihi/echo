import type { BadgeTheme } from "@/shared/components/atomics/badge/Badge";
import type {
  RecordUIPresentation,
  RecordingAction,
} from "@/views/management-records/models/interface";

export class RecordRowViewModel {
  constructor(private readonly record: RecordUIPresentation) {}

  badge(): { theme: BadgeTheme; label: string } {
    const { status } = this.record;

    switch (status) {
      case "connected": {
        return {
          theme: "green",
          label: "정상 연결",
        };
      }
      case "delete-failed": {
        return {
          theme: "red",
          label: "삭제 실패",
        };
      }
      case "orphaned": {
        return {
          theme: "yellow",
          label: "orphan",
        };
      }
    }
  }

  actionButton(): RecordingAction {
    const { status } = this.record;

    switch (status) {
      case "connected": {
        return {
          type: "connected",
          disabled: false,
        };
      }
      case "delete-failed": {
        return {
          type: "delete-failed",
          disabled: false,
          action: async () => {
            // TODO: 함수 연결
          },
        };
      }
      case "orphaned": {
        return {
          type: "orphaned",
          disabled: false,
          action: async () => {
            // TODO: 함수 연결
          },
        };
      }
    }
  }
}
