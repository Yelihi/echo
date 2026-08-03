"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/shared/components";
import { ConfirmDialog } from "@/shared/components/ui";
import { errorPopupManager } from "@/shared/lib/error-popup";
import { MemorizationEditorSourcePanel } from "@/views/memorization/ui/MemorizationEditorSourcePanel";
import { MemorizationParagraphReviewPanel } from "@/views/memorization/ui/MemorizationParagraphReviewPanel";
import type {
  MemorizationEditorDraft,
  MemorizationEditorMode,
} from "@/views/memorization/models/editor";

interface MemorizationEditorClientProps {
  mode: MemorizationEditorMode;
  initialDraft: MemorizationEditorDraft;
}

export function MemorizationEditorClient({ mode, initialDraft }: MemorizationEditorClientProps) {
  const router = useRouter();
  const [draft, setDraft] = useState(initialDraft);
  const [confirmCancelOpen, setConfirmCancelOpen] = useState(false);
  const [edited, setEdited] = useState(false);

  const validParagraphs = useMemo(
    () => draft.paragraphs.filter((paragraph) => paragraph.trim().length > 0),
    [draft.paragraphs],
  );

  const markEdited = (nextDraft: MemorizationEditorDraft) => {
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

    router.push("/sentence-memorization");
  };

  const save = () => {
    if (!draft.title.trim()) {
      errorPopupManager.open({
        title: "제목을 입력해주세요",
        message: "문장 암기 자료를 저장하려면 제목이 필요합니다.",
      });
      return;
    }

    if (!draft.rawText.trim()) {
      errorPopupManager.open({
        title: "본문을 입력해주세요",
        message: "암기할 영어 본문을 입력해주세요.",
      });
      return;
    }

    if (!draft.confirmed || validParagraphs.length === 0) {
      errorPopupManager.open({
        title: "문단을 확정해주세요",
        message: "문단 초안을 검수하고 확정해야 저장할 수 있습니다.",
      });
      return;
    }

    // TODO: 저장 server action 연결 시 draft를 전달합니다.
  };

  return (
    <>
      <section className="flex w-full flex-col gap-7" data-pillar="memo">
        <header className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="flex min-w-0 flex-col gap-1.5">
            <h1 className="text-heading-md font-bold text-black-primary">
              {mode === "create" ? "문장 암기 자료 만들기" : "문장 암기 자료 수정"}
            </h1>
            <p className="text-body-4 text-gray-text">
              긴 영어 본문을 입력하고 암기 기준 문단을 확정하세요.
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

        <div className="grid w-full gap-5 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
          <MemorizationEditorSourcePanel draft={draft} onChange={markEdited} onDirty={markDirty} />
          <MemorizationParagraphReviewPanel draft={draft} onChange={markEdited} />
        </div>
      </section>

      <ConfirmDialog
        open={confirmCancelOpen}
        onOpenChange={setConfirmCancelOpen}
        title="편집을 취소할까요?"
        description="지금까지 입력한 내용은 저장되지 않습니다."
        confirmLabel="나가기"
        cancelLabel="계속 편집"
        onConfirm={() => router.push("/sentence-memorization")}
      />
    </>
  );
}
