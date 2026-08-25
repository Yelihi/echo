"use client";

import { useShallow } from "zustand/react/shallow";

// shared
import {
  AddLineButton,
  ChatBubbleInput,
  ChatEditorRow,
  EditorPanelHeader,
} from "@/shared/components/ui";

// views
import { useRolePlayEditorStore } from "@/views/role-play/models/stores/rolePlayEditorStore";

export function RolePlayScriptEditor() {
  return (
    <div className="min-w-0 overflow-hidden rounded-card border border-card-line bg-white shadow-emphasize">
      <RolePlayScriptHeader />
      <RolePlayScriptLineList />
      <RolePlayScriptAddLineBar />
    </div>
  );
}

function RolePlayScriptHeader() {
  return <EditorPanelHeader title="대화 스크립트" meta={<RolePlayScriptLineCount />} />;
}

function RolePlayScriptLineCount() {
  const validLineCount = useRolePlayEditorStore(
    (state) => state.draft.lines.filter((line) => line.text.trim().length > 0).length,
  );

  return `${validLineCount}개 대사`;
}

function RolePlayScriptLineList() {
  // useShallow 를 통해 Object.is 비교 기반의 객체 비교의 부작용인 매 리렌더링을 방지
  const lineIds = useRolePlayEditorStore(
    useShallow((state) => state.draft.lines.map((line) => line.id)),
  );

  return (
    <div className="flex max-h-[620px] min-h-100 flex-col gap-4 overflow-y-auto bg-gray-background px-4 py-5 md:px-6">
      {lineIds.map((lineId, index) => (
        <RolePlayScriptLine key={lineId} lineId={lineId} index={index} />
      ))}
    </div>
  );
}

function RolePlayScriptLine({ lineId, index }: { lineId: string; index: number }) {
  const line = useRolePlayEditorStore((state) =>
    state.draft.lines.find((item) => item.id === lineId),
  );

  if (!line) return null;

  const speakerLabel = line.speaker === "me" ? "나" : "상대방";

  return (
    <ChatEditorRow
      speaker={line.speaker}
      speakerLabel={speakerLabel}
      onFlipSpeaker={() => useRolePlayEditorStore.getState().flipLineSpeaker(lineId)}
      onDelete={() => useRolePlayEditorStore.getState().deleteLine(lineId)}
    >
      <ChatBubbleInput
        speaker={line.speaker}
        aria-label={`${index + 1}번째 ${line.speaker === "me" ? "내" : "상대방"} 대사`}
        value={line.text}
        placeholder={
          line.speaker === "me" ? "내가 말할 대사를 입력하세요." : "상대방 대사를 입력하세요."
        }
        onChange={(event) =>
          useRolePlayEditorStore.getState().updateLineText(lineId, event.target.value)
        }
      />
    </ChatEditorRow>
  );
}

function RolePlayScriptAddLineBar() {
  return (
    <div className="flex flex-wrap justify-end gap-2 border-t border-card-line bg-card-surface px-4 py-3">
      <AddLineButton
        speaker="partner"
        onClick={() => useRolePlayEditorStore.getState().addLine("partner")}
      >
        상대방 대사
      </AddLineButton>
      <AddLineButton speaker="me" onClick={() => useRolePlayEditorStore.getState().addLine("me")}>
        내 대사
      </AddLineButton>
    </div>
  );
}
