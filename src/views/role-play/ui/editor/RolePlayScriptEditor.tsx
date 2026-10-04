"use client";

import { useShallow } from "zustand/react/shallow";
import { ArrowLeftRight, Trash2, Plus } from "lucide-react";
import { Textarea } from "@/shared/components";
import { LoadingState } from "@/shared/components/ui";
import styles from "@/shared/components/editor/Editor.module.css";
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
    <section className={styles.panel} aria-labelledby="script-title">
      <div className={styles.panelHeading}>
        <h2 id="script-title">대화 스크립트</h2>
        <span>{count}개 대사</span>
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
              <div className={styles.scriptHeading} aria-hidden>
                <span>순서</span>
                <span>화자</span>
                <span>대사</span>
                <span>관리</span>
              </div>
              <div className={styles.scriptList}>
                {lineIds.map((id, index) => (
                  <ScriptLine key={id} id={id} index={index} />
                ))}
              </div>
            </>
          ) : (
            <div className={styles.empty}>
              <p>아직 대사가 없어요</p>
              <p>TXT를 불러오거나, 아래 버튼으로 대사를 추가하세요.</p>
            </div>
          )}
          <div className={styles.addBar}>
            <button
              type="button"
              onClick={() => useRolePlayEditorStore.getState().addLine("partner")}
            >
              <Plus size={15} aria-hidden />
              상대방 대사
            </button>
            <button type="button" onClick={() => useRolePlayEditorStore.getState().addLine("me")}>
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
    <div className={styles.scriptRow}>
      <span className={styles.lineNumber}>{String(index + 1).padStart(2, "0")}</span>
      <button
        type="button"
        className={styles.speaker}
        data-speaker={line.speaker}
        aria-label={`${index + 1}번째 화자 바꾸기`}
        onClick={() => useRolePlayEditorStore.getState().flipLineSpeaker(id)}
      >
        {line.speaker === "me" ? "나" : "상대방"}
        <ArrowLeftRight size={13} aria-hidden />
      </button>
      <Textarea
        rows={2}
        className={styles.scriptInput}
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
        className={styles.iconButton}
        aria-label={`${index + 1}번째 대사 삭제`}
        onClick={() => useRolePlayEditorStore.getState().deleteLine(id)}
      >
        <Trash2 size={16} aria-hidden />
      </button>
    </div>
  );
}
