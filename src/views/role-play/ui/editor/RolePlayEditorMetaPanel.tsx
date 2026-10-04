"use client";

// shared
import { Input } from "@/shared/components";
import { TagInputField } from "@/shared/components/ui";

// features
import type { RolePlayEditorMetaPanelProps } from "@/views/role-play/models/interface";

// views
import { useRolePlayEditorStore } from "@/views/role-play/models/stores/rolePlayEditorStore";
import { RolePlayImportTxtButton } from "@/views/role-play/ui/editor/RolePlayImportTxtButton";

function RolePlayTitleField() {
  const title = useRolePlayEditorStore((state) => state.draft.title);
  const setTitle = useRolePlayEditorStore((state) => state.setTitle);

  return (
    <label className="flex min-w-0 flex-col gap-2.5">
      <span className="text-[13px] font-normal text-practice-muted">제목</span>
      <Input
        className="rounded-[7px] border border-practice-input-line bg-white px-3.5 py-2.75 text-[15px] leading-[1.7] font-normal text-practice-body shadow-practice-input placeholder:text-practice-muted focus:border-practice-focus focus:ring-2 focus:ring-practice-accent/6 focus:outline-none focus-visible:border-practice-focus focus-visible:inset-ring-0"
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
    <label className="flex min-w-0 flex-col gap-2.5">
      <span className="text-[13px] font-normal text-practice-muted">상황 설명</span>
      <Input
        className="rounded-[7px] border border-practice-input-line bg-white px-3.5 py-2.75 text-[15px] leading-[1.7] font-normal text-practice-body shadow-practice-input placeholder:text-practice-muted focus:border-practice-focus focus:ring-2 focus:ring-practice-accent/6 focus:outline-none focus-visible:border-practice-focus focus-visible:inset-ring-0"
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
    <div className="flex min-w-0 flex-col gap-2.5">
      <span className="text-[13px] font-normal text-practice-muted">태그</span>
      <TagInputField
        className="min-h-12 rounded-[7px] border-practice-input-line bg-white px-2.5 py-1.25 [&_input]:h-8 [&_input]:border-0 [&_input]:bg-white [&_input]:p-0 [&_input]:text-[15px] [&_input]:leading-[1.7] [&_input]:font-normal [&_input]:text-practice-body [&_input]:shadow-none [&_input::placeholder]:text-practice-muted [&_[data-slot=tag-input-chip]]:rounded [&_[data-slot=tag-input-chip]]:border-0 [&_[data-slot=tag-input-chip]]:bg-practice-chip [&_[data-slot=tag-input-chip]]:text-[12px] [&_[data-slot=tag-input-chip]]:text-practice-secondary [&_[data-slot=tag-input-chip]_button]:h-8 [&_[data-slot=tag-input-chip]_button]:w-6.5"
        theme="roleplay"
        tags={tags}
        placeholder="태그 입력 후 Enter"
        onChange={setTags}
        onInputDirty={markDirty}
      />
    </div>
  );
}

export function RolePlayEditorMetaPanel({ txtImport }: RolePlayEditorMetaPanelProps) {
  return (
    <section
      className="min-w-0 rounded-[14px] border border-practice-panel-line bg-white p-8 shadow-practice-panel max-editor:p-6.5 max-compact:px-4.5 max-compact:py-5.5"
      aria-labelledby="roleplay-meta-title"
    >
      <div className="mb-7 flex items-center justify-between gap-5 max-compact:items-start max-compact:gap-3">
        <h2
          className="text-[19px] font-medium text-practice-body max-compact:text-[17px]"
          id="roleplay-meta-title"
        >
          기본 정보
        </h2>
        <RolePlayImportTxtButton {...txtImport} />
      </div>
      <div className="grid grid-cols-2 gap-x-9 gap-y-6.25 max-compact:grid-cols-1 max-compact:gap-5.5">
        <RolePlayTitleField />
        <RolePlaySituationField />
        <div className="col-span-full">
          <RolePlayTagsField />
        </div>
      </div>
      <p className="mt-3 text-[12px] leading-[1.8] text-practice-muted">
        태그를 추가하면 자료를 쉽게 찾을 수 있어요.
      </p>
    </section>
  );
}
