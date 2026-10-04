"use client";
import { ArrowLeftRight, Trash2 } from "lucide-react";
import { Textarea } from "@/shared/components";
import type { RolePlayScriptLineProps } from "@/views/role-play/models/interface";
import { useRolePlayEditorStore } from "@/views/role-play/models/stores/rolePlayEditorStore";
export function RolePlayScriptLine({ id, index }: RolePlayScriptLineProps) {
  const line = useRolePlayEditorStore((state) => state.draft.lines.find((item) => item.id === id));
  if (!line) return null;
  return (
    <div className="grid grid-cols-[32px_105px_minmax(0,1fr)_44px] items-start gap-3.5 border-b border-practice-panel-line py-5 max-compact:grid-cols-[22px_1fr_44px] max-compact:gap-2">
      <span className="pt-3.75 text-[12px] text-practice-muted max-compact:pt-3.25">
        {String(index + 1).padStart(2, "0")}
      </span>
      <button
        type="button"
        className="flex min-h-12 items-center gap-2.5 text-[12px] text-practice-secondary data-[speaker=me]:text-practice-focus max-compact:min-h-11"
        data-speaker={line.speaker}
        aria-label={`${index + 1}번째 화자 바꾸기`}
        onClick={() => useRolePlayEditorStore.getState().flipLineSpeaker(id)}
      >
        {line.speaker === "me" ? "나" : "상대방"}
        <ArrowLeftRight size={13} aria-hidden />
      </button>
      <Textarea
        rows={2}
        className="min-h-19.5 resize-y px-4 py-3 text-[16px] leading-[1.8] max-compact:col-span-full max-compact:row-start-2"
        aria-label={`${index + 1}번째 ${line.speaker === "me" ? "내" : "상대방"} 대사`}
        value={line.text}
        placeholder={
          line.speaker === "me" ? "내가 말할 대사를 입력하세요." : "상대방 대사를 입력하세요."
        }
        onChange={(event) =>
          useRolePlayEditorStore.getState().updateLineText(id, event.target.value)
        }
      />
      <button
        type="button"
        className="grid min-h-11 min-w-11 place-items-center rounded-md text-practice-subtle hover:bg-practice-accent-subtle hover:text-practice-focus max-compact:col-start-3 max-compact:row-start-1"
        aria-label={`${index + 1}번째 대사 삭제`}
        onClick={() => useRolePlayEditorStore.getState().deleteLine(id)}
      >
        <Trash2 size={16} aria-hidden />
      </button>
    </div>
  );
}
