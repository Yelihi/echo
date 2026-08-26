"use client";

import { useShallow } from "zustand/react/shallow";
import { MessageSquare } from "lucide-react";

// shared
import {
  AddLineButton,
  ChatBubbleInput,
  ChatEditorRow,
  EditorPanelHeader,
  EmptyState,
  LoadingState,
} from "@/shared/components/ui";

// views
import type {
  RolePlayScriptEditorProps,
  RolePlayScriptLineListProps,
} from "@/views/role-play/models/interface";
import { useRolePlayEditorStore } from "@/views/role-play/models/stores/rolePlayEditorStore";

export function RolePlayScriptEditor({ isPending }: RolePlayScriptEditorProps) {
  return (
    <div className="min-w-0 overflow-hidden rounded-card border border-card-line bg-white shadow-emphasize">
      <RolePlayScriptHeader />
      <RolePlayScriptLineList isPending={isPending} />
      {isPending ? null : <RolePlayScriptAddLineBar />}
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

function RolePlayScriptLineList({ isPending }: RolePlayScriptLineListProps) {
  // useShallow 를 통해 Object.is 비교 기반의 객체 비교의 부작용인 매 리렌더링을 방지
  const lineIds = useRolePlayEditorStore(
    useShallow((state) => state.draft.lines.map((line) => line.id)),
  );

  return (
    <div className="flex h-100 flex-col overflow-y-auto bg-gray-background">
      {isPending ? (
        <RolePlayScriptPending />
      ) : lineIds.length === 0 ? (
        <RolePlayScriptEmpty />
      ) : (
        <div className="flex flex-col gap-4 px-4 py-5 md:px-6">
          {lineIds.map((lineId, index) => (
            <RolePlayScriptLine key={lineId} lineId={lineId} index={index} />
          ))}
        </div>
      )}
    </div>
  );
}

function RolePlayScriptPending() {
  return (
    <LoadingState
      className="my-auto"
      title="대본을 불러오는 중이에요"
      description="TXT 대화를 두 명의 대사로 정리하고 있어요."
    />
  );
}

function RolePlayScriptEmpty() {
  return (
    <EmptyState
      className="my-auto"
      icon={<MessageSquare />}
      title="아직 대사가 없어요"
      description="왼쪽에서 TXT를 불러오거나, 아래 버튼으로 상대방과 내 대사를 추가해 보세요."
    />
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
