"use client";

import { FileUp } from "lucide-react";

// shared
import { Input, TitleField } from "@/shared/components";
import { DashedActionButton, TagInputField } from "@/shared/components/ui";

// views
import { useRolePlayEditorStore } from "@/views/role-play/models/stores/rolePlayEditorStore";

function RolePlayTitleField() {
  const title = useRolePlayEditorStore((state) => state.draft.title);
  const setTitle = useRolePlayEditorStore((state) => state.setTitle);

  return (
    <label className="flex flex-col gap-2">
      <span className="text-body-2 font-bold text-gray-text">제목</span>
      <TitleField
        value={title}
        placeholder="예: Ordering at a Cafe"
        onChange={(event) => setTitle(event.target.value)}
      />
    </label>
  );
}

function RolePlaySituationField() {
  const situation = useRolePlayEditorStore((state) => state.draft.situation);
  const setSituation = useRolePlayEditorStore((state) => state.setSituation);

  return (
    <label className="mt-4 flex flex-col gap-2">
      <span className="text-body-2 font-bold text-gray-text">상황 설명</span>
      <Input
        value={situation}
        placeholder="예: 카페에서 주문하기"
        onChange={(event) => setSituation(event.target.value)}
      />
    </label>
  );
}

function RolePlayTagsField() {
  const tags = useRolePlayEditorStore((state) => state.draft.tags);
  const setTags = useRolePlayEditorStore((state) => state.setTags);
  const markDirty = useRolePlayEditorStore((state) => state.markDirty);

  return (
    <div className="mt-4 flex flex-col gap-2">
      <span className="text-body-2 font-bold text-gray-text">태그</span>
      <TagInputField
        theme="roleplay"
        tags={tags}
        placeholder="태그 입력 후 Enter"
        onChange={setTags}
        onInputDirty={markDirty}
      />
    </div>
  );
}

export function RolePlayEditorMetaPanel() {
  return (
    <aside className="flex min-w-0 flex-col gap-4">
      <div className="rounded-card border border-card-line bg-white p-5 shadow-emphasize">
        <RolePlayTitleField />
        <RolePlaySituationField />
        <RolePlayTagsField />
      </div>

      <DashedActionButton icon={<FileUp className="size-4" />}>
        TXT 파일로 불러오기
      </DashedActionButton>
    </aside>
  );
}
