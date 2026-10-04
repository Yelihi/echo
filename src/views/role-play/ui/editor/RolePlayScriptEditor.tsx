"use client";

import { useShallow } from "zustand/react/shallow";
import { ArrowLeftRight, Trash2, Plus } from "lucide-react";
import { Textarea } from "@/shared/components";
import { LoadingState } from "@/shared/components/ui";
import type {
  RolePlayScriptEditorProps,
  RolePlayScriptLineProps,
} from "@/views/role-play/models/interface";
import { useRolePlayEditorStore } from "@/views/role-play/models/stores/rolePlayEditorStore";

export function RolePlayScriptEditor({ isPending }: RolePlayScriptEditorProps) {
  const lineIds = useRolePlayEditorStore(
    useShallow((state) => state.draft.lines.map((line) => line.id)),
  );
  const count = useRolePlayEditorStore(
    (state) => state.draft.lines.filter((line) => line.text.trim()).length,
  );
  return (
    <section
      className="min-w-0 rounded-[14px] border border-practice-panel-line bg-white p-8 shadow-practice-panel max-editor:p-6.5 max-compact:px-4.5 max-compact:py-5.5"
      aria-labelledby="script-title"
    >
      <div className="mb-7 flex items-center justify-between gap-5 max-compact:items-start max-compact:gap-3">
        <h2
          className="text-[19px] font-medium text-practice-body max-compact:text-[17px]"
          id="script-title"
        >
          대화 스크립트
        </h2>
        <span className="text-[12px] text-practice-muted">{count}개 대사</span>
      </div>
      {isPending ? (
        <LoadingState
          title="대본을 불러오는 중이에요"
          description="TXT 대화를 두 명의 대사로 정리하고 있어요."
        />
      ) : (
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
                  <ScriptLine key={id} id={id} index={index} />
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
      )}
    </section>
  );
}
function ScriptLine({ id, index }: RolePlayScriptLineProps) {
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
        className="min-h-19.5 resize-y rounded-[7px] border border-practice-input-line bg-white px-4 py-3 text-[16px] leading-[1.8] text-practice-body focus:border-practice-focus focus:outline-none focus-visible:border-practice-focus max-compact:col-span-full max-compact:row-start-2"
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
