"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronUp, Sparkles, Trash } from "lucide-react";

import { Button, Textarea, TitleField } from "@/shared/components";
import {
  ConfirmDialog,
  DashedActionButton,
  EditorPanelHeader,
  ParagraphRow,
  TagInput,
} from "@/shared/components/ui";
import { errorPopupManager } from "@/shared/lib/error-popup";
import type {
  MemorizationEditorDraft,
  MemorizationEditorMode,
} from "@/views/memorization/models/editor";

interface MemorizationEditorClientProps {
  mode: MemorizationEditorMode;
  initialDraft: MemorizationEditorDraft;
}

function ParagraphActionButton({
  label,
  children,
  onClick,
}: {
  label: string;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="inline-flex size-7.5 cursor-pointer items-center justify-center rounded-md text-gray-text transition-colors outline-none hover:bg-gray-background [&_svg]:size-3.75"
    >
      {children}
    </button>
  );
}

const splitParagraphs = (text: string) =>
  text
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

export function MemorizationEditorClient({ mode, initialDraft }: MemorizationEditorClientProps) {
  const router = useRouter();
  const [draft, setDraft] = useState(initialDraft);
  const [tagDraft, setTagDraft] = useState("");
  const [confirmCancelOpen, setConfirmCancelOpen] = useState(false);
  const [edited, setEdited] = useState(false);

  const wordCount = useMemo(
    () => draft.rawText.trim().split(/\s+/).filter(Boolean).length,
    [draft.rawText],
  );

  const validParagraphs = useMemo(
    () => draft.paragraphs.filter((paragraph) => paragraph.trim().length > 0),
    [draft.paragraphs],
  );

  const markEdited = (nextDraft: MemorizationEditorDraft) => {
    setDraft(nextDraft);
    setEdited(true);
  };

  const addTag = () => {
    const nextTag = tagDraft.trim().replace(/,$/, "");
    if (!nextTag || draft.tags.includes(nextTag)) {
      setTagDraft("");
      return;
    }

    markEdited({ ...draft, tags: [...draft.tags, nextTag] });
    setTagDraft("");
  };

  const updateRawText = (rawText: string) => {
    markEdited({ ...draft, rawText, confirmed: false });
  };

  const createParagraphDraft = () => {
    const paragraphs = splitParagraphs(draft.rawText);
    if (paragraphs.length === 0) {
      errorPopupManager.open({
        title: "본문을 입력해주세요",
        message: "문단 초안을 만들려면 먼저 암기할 본문이 필요합니다.",
      });
      return;
    }

    // TODO: AI 문단 제안 provider 연결 시 이 local split 을 교체합니다.
    markEdited({ ...draft, paragraphs, confirmed: false });
  };

  const updateParagraph = (index: number, value: string) => {
    markEdited({
      ...draft,
      confirmed: false,
      paragraphs: draft.paragraphs.map((paragraph, currentIndex) =>
        currentIndex === index ? value : paragraph,
      ),
    });
  };

  const mergeParagraph = (index: number) => {
    if (index === 0) return;

    markEdited({
      ...draft,
      confirmed: false,
      paragraphs: draft.paragraphs.reduce<string[]>((paragraphs, paragraph, currentIndex) => {
        if (currentIndex === index - 1) {
          paragraphs.push(`${paragraph} ${draft.paragraphs[index]}`.trim());
          return paragraphs;
        }

        if (currentIndex !== index) paragraphs.push(paragraph);
        return paragraphs;
      }, []),
    });
  };

  const deleteParagraph = (index: number) => {
    markEdited({
      ...draft,
      confirmed: false,
      paragraphs: draft.paragraphs.filter((_, currentIndex) => currentIndex !== index),
    });
  };

  const confirmParagraphs = () => {
    if (validParagraphs.length === 0) {
      errorPopupManager.open({
        title: "확정할 문단이 없습니다",
        message: "본문으로 문단 초안을 만든 뒤 다시 시도해주세요.",
      });
      return;
    }

    markEdited({ ...draft, paragraphs: validParagraphs, confirmed: true });
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
          <aside className="flex min-w-0 flex-col gap-4">
            <div className="rounded-card border border-card-line bg-white p-5 shadow-emphasize">
              <label className="flex flex-col gap-2">
                <span className="text-body-2 font-bold text-gray-text">제목</span>
                <TitleField
                  value={draft.title}
                  placeholder="예: Business Email Openings"
                  onChange={(event) => markEdited({ ...draft, title: event.target.value })}
                />
              </label>
              <div className="mt-4 flex flex-col gap-2">
                <span className="text-body-2 font-bold text-gray-text">태그</span>
                <TagInput
                  theme="memo"
                  tags={draft.tags}
                  placeholder="태그 입력 후 Enter"
                  onRemoveTag={(tag) =>
                    markEdited({ ...draft, tags: draft.tags.filter((item) => item !== tag) })
                  }
                  inputProps={{
                    value: tagDraft,
                    onChange: (event) => setTagDraft(event.target.value),
                    onKeyDown: (event) => {
                      if (event.key === "Enter" || event.key === ",") {
                        event.preventDefault();
                        addTag();
                      }
                    },
                  }}
                />
              </div>
            </div>

            <div className="rounded-card border border-card-line bg-white p-5 shadow-emphasize">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-body-2 font-bold text-gray-text">본문</span>
                <span className="text-body-1 font-bold text-gray-text-secondary">
                  {wordCount} words
                </span>
              </div>
              <Textarea
                rows={14}
                value={draft.rawText}
                placeholder="암기할 영어 본문을 입력하세요."
                onChange={(event) => updateRawText(event.target.value)}
              />
            </div>

            <DashedActionButton
              icon={<Sparkles className="size-4" />}
              onClick={createParagraphDraft}
            >
              AI 문단 제안 요청
            </DashedActionButton>
          </aside>

          <div className="min-w-0 overflow-hidden rounded-card border border-card-line bg-white shadow-emphasize">
            <EditorPanelHeader
              title="문단 검수"
              meta={draft.confirmed ? "확정됨" : `${validParagraphs.length}개 문단`}
            />
            <div className="flex max-h-[720px] min-h-120 flex-col gap-3 overflow-y-auto bg-gray-background px-4 py-5 md:px-6">
              {draft.paragraphs.length === 0 ? (
                <div className="flex min-h-80 items-center justify-center rounded-control border border-dashed border-card-line-strong bg-card-surface px-6 text-center text-body-3 text-gray-text">
                  본문을 입력한 뒤 AI 문단 제안 요청을 눌러 초안을 만드세요.
                </div>
              ) : (
                draft.paragraphs.map((paragraph, index) => (
                  <ParagraphRow
                    key={index}
                    index={index + 1}
                    mode={draft.confirmed ? "confirmed" : "edit"}
                    actions={
                      <>
                        <ParagraphActionButton
                          label="위 문단과 합치기"
                          onClick={() => mergeParagraph(index)}
                        >
                          <ChevronUp />
                        </ParagraphActionButton>
                        <ParagraphActionButton
                          label="문단 삭제"
                          onClick={() => deleteParagraph(index)}
                        >
                          <Trash />
                        </ParagraphActionButton>
                      </>
                    }
                  >
                    {draft.confirmed ? (
                      <p className="py-2 text-body-4 leading-relaxed text-black-primary">
                        {paragraph}
                      </p>
                    ) : (
                      <Textarea
                        rows={3}
                        value={paragraph}
                        onChange={(event) => updateParagraph(index, event.target.value)}
                      />
                    )}
                  </ParagraphRow>
                ))
              )}
            </div>
            <div className="flex justify-end border-t border-card-line bg-card-surface px-4 py-3">
              <Button type="button" variant="secondary" size="lg" onClick={confirmParagraphs}>
                <Check className="size-4" />
                문단 확정
              </Button>
            </div>
          </div>
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
