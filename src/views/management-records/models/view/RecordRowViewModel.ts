import type { BadgeTheme } from "@/shared/components/atomics/badge/Badge";
import type { RecordUIPresentation } from "@/views/management-records/models/interface";

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
          label: "미채택",
        };
      }
    }
  }
}
