import type { Database } from "@/shared/lib/supabase";
import type { RecordUIPresentation } from "../interface";

export function convertManagedRecording(
  row: Database["public"]["Views"]["recording_management_records"]["Row"],
): RecordUIPresentation {
  if (row.status !== "connected" && row.status !== "orphaned" && row.status !== "delete-failed") {
    throw new Error("Unknown recording status");
  }
  return {
    id: row.id,
    status: row.status,
    name: row.object_path.split("/").at(-1) ?? row.id,
    fileSize:
      row.size_bytes >= 1024 * 1024
        ? `${(row.size_bytes / (1024 * 1024)).toFixed(1)} MB`
        : `${Math.max(1, Math.round(row.size_bytes / 1024))} KB`,
    createdAt: new Intl.DateTimeFormat("ko-KR", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "Asia/Seoul",
    }).format(new Date(row.created_at)),
    ...(row.session_id ? { inSession: row.session_id } : {}),
  };
}
