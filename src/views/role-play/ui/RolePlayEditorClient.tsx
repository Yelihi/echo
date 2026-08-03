"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/shared/components";
import { ConfirmDialog } from "@/shared/components/ui";
import { errorPopupManager } from "@/shared/lib/error-popup";
import { RolePlayEditorMetaPanel } from "@/views/role-play/ui/RolePlayEditorMetaPanel";
import { RolePlayScriptEditor } from "@/views/role-play/ui/RolePlayScriptEditor";
import type { RoleplayEditorDraft, RoleplayEditorMode } from "@/views/role-play/models/editor";

interface RolePlayEditorClientProps {
  mode: RoleplayEditorMode;
  initialDraft: RoleplayEditorDraft;
}

export function RolePlayEditorClient({ mode, initialDraft }: RolePlayEditorClientProps) {
  const router = useRouter();
  const [draft, setDraft] = useState(initialDraft);
  const [confirmCancelOpen, setConfirmCancelOpen] = useState(false);
  const [edited, setEdited] = useState(false);

  const validLines = useMemo(
    () => draft.lines.filter((line) => line.text.trim().length > 0),
    [draft.lines],
  );

  const markEdited = (nextDraft: RoleplayEditorDraft) => {
    setDraft(nextDraft);
    setEdited(true);
  };

  const markDirty = () => {
    setEdited(true);
  };

  const cancel = () => {
    if (edited) {
      setConfirmCancelOpen(true);
      return;
    }

    router.push("/role-playing");
  };

  const save = () => {
    if (!draft.title.trim()) {
      errorPopupManager.open({
        title: "제목을 입력해주세요",
        message: "롤플레잉 자료를 저장하려면 제목이 필요합니다.",
      });
      return;
    }

    if (validLines.length === 0) {
      errorPopupManager.open({
        title: "대사를 입력해주세요",
        message: "상대방 또는 내 대사가 최소 1개 이상 필요합니다.",
      });
      return;
    }

    // TODO: 저장 server action 연결 시 draft를 전달합니다.
  };

  return (
    <>
      <section className="flex w-full flex-col gap-7" data-pillar="roleplay">
        <header className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="flex min-w-0 flex-col gap-1.5">
            <h1 className="text-heading-md font-bold text-black-primary">
              {mode === "create" ? "롤플레잉 자료 만들기" : "롤플레잉 자료 수정"}
            </h1>
            <p className="text-body-4 text-gray-text">
              상대방과 내 대사를 채팅 흐름으로 정리하세요.
            </p>
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" size="lg" onClick={cancel}>
              취소
            </Button>
            <Button type="button" size="lg" onClick={save}>
              저장
            </Button>
          </div>
        </header>

        <div className="grid w-full gap-5 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
          <RolePlayEditorMetaPanel draft={draft} onChange={markEdited} onDirty={markDirty} />
          <RolePlayScriptEditor
            lines={draft.lines}
            onChange={(lines) => markEdited({ ...draft, lines })}
          />
        </div>
      </section>

      <ConfirmDialog
        open={confirmCancelOpen}
        onOpenChange={setConfirmCancelOpen}
        title="편집을 취소할까요?"
        description="지금까지 입력한 내용은 저장되지 않습니다."
        confirmLabel="나가기"
        cancelLabel="계속 편집"
        onConfirm={() => router.push("/role-playing")}
      />
    </>
  );
}
