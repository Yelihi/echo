"use client";

import Link from "next/link";
import { Button } from "@/shared/components/atomics/button/Button";
import { exampleErrorMessage, isBlockedExampleError } from "../models/errors";
import { useExamples } from "./ExampleProvider";

export function ExampleActions() {
  const pending = useExamples((s) => s.pending);
  const error = useExamples((s) => s.error);
  const editing = useExamples((s) => Object.keys(s.editing).length > 0);
  const selected = useExamples((s) => s.selected.length);
  const count = useExamples((s) => s.candidates.length);
  const generate = useExamples((s) => s.generate);
  const save = useExamples((s) => s.save);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <Button
          variant="outline"
          onClick={() => void generate()}
          disabled={!!pending || editing || isBlockedExampleError(error)}
        >
          {pending === "all"
            ? "예문 생성 중…"
            : error || count
              ? "예문 다시 생성"
              : "예문 3개 생성"}
        </Button>
        {count > 0 && (
          <Button
            onClick={() => void save()}
            disabled={
              !!pending ||
              !selected ||
              error === "UNAUTHORIZED" ||
              error === "NOT_FOUND" ||
              error === "VERSION_CONFLICT" ||
              error === "IDEMPOTENCY_CONFLICT"
            }
          >
            {pending === "save" ? "저장 중…" : `선택한 예문 ${selected}개 저장`}
          </Button>
        )}
      </div>
      {editing && (
        <p className="text-sm text-gray-text">
          수정을 완료하거나 취소한 뒤 새 예문을 생성할 수 있습니다.
        </p>
      )}
      {error && (
        <div role="alert" className="space-y-2 text-sm text-destructive">
          <p>{exampleErrorMessage(error)}</p>
          {error === "UNAUTHORIZED" && (
            <Link href="/login" className="underline">
              로그인 페이지로 이동
            </Link>
          )}
          {(error === "NOT_FOUND" || error === "NOT_INVITED") && (
            <Link href="/grammar" className="underline">
              노트 목록으로 이동
            </Link>
          )}
          {(error === "VERSION_CONFLICT" || error === "IDEMPOTENCY_CONFLICT") && (
            <button type="button" className="underline" onClick={() => window.location.reload()}>
              최신 노트로 새로고침
            </button>
          )}
        </div>
      )}
      {pending && (
        <p role="status" className="text-sm text-gray-text">
          {pending === "save"
            ? "선택한 예문을 저장하고 있습니다."
            : pending.startsWith("blocks:")
              ? "수정한 문장의 직독직해를 다시 만들고 있습니다."
              : "같은 어법을 사용하는 새로운 예문을 만들고 있습니다."}
        </p>
      )}
    </div>
  );
}
