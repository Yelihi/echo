"use client";
import { useRolePlayEditorStore } from "@/views/role-play/models/stores/rolePlayEditorStore";
export function RolePlayScriptCount() {
  const count = useRolePlayEditorStore(
    (state) => state.draft.lines.filter((line) => line.text.trim()).length,
  );
  return <span className="text-[12px] text-practice-muted">{count}개 대사</span>;
}
