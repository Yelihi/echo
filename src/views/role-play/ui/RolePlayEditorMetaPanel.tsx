"use client";

import { FileUp } from "lucide-react";

import { Input, TitleField } from "@/shared/components";
import { DashedActionButton, TagInput } from "@/shared/components/ui";
import { useTagInputController } from "@/shared/hooks/useTagInputController";
import type { RoleplayEditorDraft } from "@/views/role-play/models/editor";

interface RolePlayEditorMetaPanelProps {
  draft: RoleplayEditorDraft;
  onChange: (draft: RoleplayEditorDraft) => void;
  onDirty: () => void;
}

export function RolePlayEditorMetaPanel({
  draft,
  onChange,
  onDirty,
}: RolePlayEditorMetaPanelProps) {
  const tagInput = useTagInputController({
    tags: draft.tags,
    onChange: (tags) => onChange({ ...draft, tags }),
    onInputDirty: onDirty,
  });

  return (
    <aside className="flex min-w-0 flex-col gap-4">
      <div className="rounded-card border border-card-line bg-white p-5 shadow-emphasize">
        <label className="flex flex-col gap-2">
          <span className="text-body-2 font-bold text-gray-text">제목</span>
          <TitleField
            value={draft.title}
            placeholder="예: Ordering at a Cafe"
            onChange={(event) => onChange({ ...draft, title: event.target.value })}
          />
        </label>
        <label className="mt-4 flex flex-col gap-2">
          <span className="text-body-2 font-bold text-gray-text">상황 설명</span>
          <Input
            value={draft.situation}
            placeholder="예: 카페에서 주문하기"
            onChange={(event) => onChange({ ...draft, situation: event.target.value })}
          />
        </label>
        <div className="mt-4 flex flex-col gap-2">
          <span className="text-body-2 font-bold text-gray-text">태그</span>
          <TagInput
            theme="roleplay"
            tags={draft.tags}
            placeholder="태그 입력 후 Enter"
            onRemoveTag={tagInput.removeTag}
            inputProps={{
              ...tagInput.inputProps,
              "aria-label": "태그 입력",
            }}
          />
        </div>
      </div>

      <DashedActionButton icon={<FileUp className="size-4" />}>
        TXT 파일로 불러오기
      </DashedActionButton>
    </aside>
  );
}
