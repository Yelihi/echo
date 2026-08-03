"use client";

import { useMemo } from "react";

import {
  AddLineButton,
  ChatBubbleInput,
  ChatEditorRow,
  EditorPanelHeader,
} from "@/shared/components/ui";
import type {
  RoleplayEditorLineDraft,
  RoleplayEditorSpeaker,
} from "@/views/role-play/models/editor";

interface RolePlayScriptEditorProps {
  lines: RoleplayEditorLineDraft[];
  onChange: (lines: RoleplayEditorLineDraft[]) => void;
}

const createLine = (speaker: RoleplayEditorSpeaker): RoleplayEditorLineDraft => ({
  id: `line-${Date.now()}-${Math.random().toString(36).slice(2)}`,
  speaker,
  text: "",
});

export function RolePlayScriptEditor({ lines, onChange }: RolePlayScriptEditorProps) {
  const validLineCount = useMemo(
    () => lines.filter((line) => line.text.trim().length > 0).length,
    [lines],
  );

  const updateLine = (lineId: string, text: string) => {
    onChange(lines.map((line) => (line.id === lineId ? { ...line, text } : line)));
  };

  const flipSpeaker = (lineId: string) => {
    onChange(
      lines.map((line) =>
        line.id === lineId ? { ...line, speaker: line.speaker === "me" ? "partner" : "me" } : line,
      ),
    );
  };

  const deleteLine = (lineId: string) => {
    onChange(lines.filter((line) => line.id !== lineId));
  };

  const addLine = (speaker: RoleplayEditorSpeaker) => {
    onChange([...lines, createLine(speaker)]);
  };

  return (
    <div className="min-w-0 overflow-hidden rounded-card border border-card-line bg-white shadow-emphasize">
      <EditorPanelHeader title="대화 스크립트" meta={`${validLineCount}개 대사`} />
      <div className="flex max-h-[620px] min-h-100 flex-col gap-4 overflow-y-auto bg-gray-background px-4 py-5 md:px-6">
        {lines.map((line, index) => (
          <ChatEditorRow
            key={line.id}
            speaker={line.speaker}
            speakerLabel={line.speaker === "me" ? "나" : "상대방"}
            onFlipSpeaker={() => flipSpeaker(line.id)}
            onDelete={() => deleteLine(line.id)}
          >
            <ChatBubbleInput
              speaker={line.speaker}
              aria-label={`${index + 1}번째 ${line.speaker === "me" ? "내" : "상대방"} 대사`}
              value={line.text}
              placeholder={
                line.speaker === "me" ? "내가 말할 대사를 입력하세요." : "상대방 대사를 입력하세요."
              }
              onChange={(event) => updateLine(line.id, event.target.value)}
            />
          </ChatEditorRow>
        ))}
      </div>
      <div className="flex flex-wrap justify-end gap-2 border-t border-card-line bg-card-surface px-4 py-3">
        <AddLineButton speaker="partner" onClick={() => addLine("partner")}>
          상대방 대사
        </AddLineButton>
        <AddLineButton speaker="me" onClick={() => addLine("me")}>
          내 대사
        </AddLineButton>
      </div>
    </div>
  );
}
