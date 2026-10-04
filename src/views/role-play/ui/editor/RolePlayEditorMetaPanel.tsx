"use client";
import styles from "@/shared/components/editor/Editor.module.css";

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
    <label className={styles.field}>
      <span>제목</span>
      <Input
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
    <label className={styles.field}>
      <span>상황 설명</span>
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
    <div className={styles.field}>
      <span>태그</span>
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

export function RolePlayEditorMetaPanel({ txtImport }: RolePlayEditorMetaPanelProps) {
  return (
    <section className={styles.panel} aria-labelledby="roleplay-meta-title">
      <div className={styles.panelHeading}>
        <h2 id="roleplay-meta-title">기본 정보</h2>
        <RolePlayImportTxtButton {...txtImport} />
      </div>
      <div className={styles.fieldGrid}>
        <RolePlayTitleField />
        <RolePlaySituationField />
        <div className={styles.fullWidth}>
          <RolePlayTagsField />
        </div>
      </div>
      <p className={styles.caption}>태그를 추가하면 자료를 쉽게 찾을 수 있어요.</p>
    </section>
  );
}
