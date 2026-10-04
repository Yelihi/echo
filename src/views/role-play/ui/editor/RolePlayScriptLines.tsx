"use client";
import { useShallow } from "zustand/react/shallow";
import { Plus } from "lucide-react";
import { useRolePlayEditorStore } from "@/views/role-play/models/stores/rolePlayEditorStore";
import { RolePlayScriptLine } from "./RolePlayScriptLine";
export function RolePlayScriptLines() {
  const lineIds = useRolePlayEditorStore(
    useShallow((state) => state.draft.lines.map((line) => line.id)),
  );
  return (
    <>
      {lineIds.length > 0 ? (
        <>
          <div
            className="grid grid-cols-[32px_105px_minmax(0,1fr)_44px] gap-3.5 border-b border-practice-panel-line pb-3 text-[11px] text-practice-muted max-compact:hidden"
            aria-hidden
          >
            <span>순서</span>
            <span>화자</span>
            <span>대사</span>
            <span>관리</span>
          </div>
          <div className="flex min-h-52.5 flex-col">
            {lineIds.map((id, index) => (
              <RolePlayScriptLine key={id} id={id} index={index} />
            ))}
          </div>
        </>
      ) : (
        <div className="flex min-h-67.5 flex-col items-center justify-center gap-3 p-6 text-center text-[13px] leading-[1.8] text-practice-muted">
          <p>아직 대사가 없어요</p>
          <p>TXT를 불러오거나, 아래 버튼으로 대사를 추가하세요.</p>
        </div>
      )}
      <div className="flex justify-start gap-3 pt-6 max-compact:flex-wrap">
        <button
          className="flex min-h-11 items-center gap-2 rounded-md border border-practice-input-line bg-white px-4 py-0 text-[12px] text-practice-secondary"
          type="button"
          onClick={() => useRolePlayEditorStore.getState().addLine("partner")}
        >
          <Plus size={15} aria-hidden />
          상대방 대사
        </button>
        <button
          className="flex min-h-11 items-center gap-2 rounded-md border border-practice-input-line bg-white px-4 py-0 text-[12px] text-practice-secondary"
          type="button"
          onClick={() => useRolePlayEditorStore.getState().addLine("me")}
        >
          <Plus size={15} aria-hidden />내 대사
        </button>
      </div>
    </>
  );
}
