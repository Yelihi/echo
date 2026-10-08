"use client";
import { useState } from "react";
import { Button } from "@/shared/components/atomics/button/Button";
import { ConfirmDialog } from "@/shared/components/ui/ConfirmDialog";
import type { GrammarExampleManagerProps } from "../models/interface";
import { ExampleProvider, useExamples } from "./ExampleProvider";
import { ExampleCandidates } from "./ExampleCandidates";
import { ExampleActions } from "./ExampleActions";
function ExampleBack({ onBack }: { onBack?: () => void }) {
  const [confirm, setConfirm] = useState(false);
  const dirty = useExamples((s) => s.dirty);
  const saving = useExamples((s) => s.pending === "save");
  const discard = useExamples((s) => s.discard);
  function leave() {
    discard();
    onBack?.();
  }
  return (
    <>
      <Button
        variant="ghost"
        disabled={saving}
        onClick={() => (dirty ? setConfirm(true) : leave())}
      >
        ← 노트로 돌아가기
      </Button>
      <ConfirmDialog
        open={confirm}
        onOpenChange={setConfirm}
        title="예문 검토를 마칠까요?"
        description="저장한 노트는 유지됩니다. 저장하지 않은 예문 후보와 수정은 사라집니다."
        confirmLabel="노트로 돌아가기"
        cancelLabel="계속 검토"
        onConfirm={leave}
      />
    </>
  );
}
/** 노트 ID로 생명주기를 구분한다. 선택 저장 후 남은 후보 보존을 위해 버전 변경으로 재마운트하지 않는다. */
export function GrammarExampleManager({ onBack, ...props }: GrammarExampleManagerProps) {
  return (
    <ExampleProvider key={props.note.id} {...props}>
      <section className="space-y-6">
        <ExampleBack onBack={onBack} />
        <header className="space-y-2">
          <p className="text-xs tracking-widest text-gray-text">STEP 02</p>
          <h2 className="text-2xl font-medium text-black-primary">
            다른 문장으로 같은 어법을 연습해요
          </h2>
          <p className="text-sm leading-relaxed text-gray-text">
            AI 예문의 뜻과 어법을 확인하세요. 문장을 수정하거나 원하는 예문만 노트에 추가할 수
            있습니다.
          </p>
        </header>
        <ExampleActions />
        <ExampleCandidates />
      </section>
    </ExampleProvider>
  );
}
