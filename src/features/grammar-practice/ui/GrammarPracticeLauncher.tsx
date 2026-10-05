"use client";

import { useRef, useState } from "react";
import type { GrammarSessionMode } from "@/entities/grammar-session";
import type { GrammarPracticeLauncherProps } from "../models/launcher";

const modes = [
  {
    mode: "recall",
    title: "암기 연습",
    label: "01 / RECALL",
    description:
      "의미 덩어리를 채우고 전체 문장을 떠올려요. 필요하면 힌트와 원문을 확인할 수 있어요.",
  },
  {
    mode: "exam",
    title: "어법 시험",
    label: "02 / APPLY",
    description:
      "기존 예문을 써보고, 새로운 문맥에 배운 어법을 적용해요. 완료 후 문장별 피드백을 받아요.",
  },
] as const;

export function GrammarPracticeLauncher({
  noteId,
  activeSessions,
  onStart,
  onOpen,
}: GrammarPracticeLauncherProps) {
  const [pending, setPending] = useState<GrammarSessionMode | null>(null);
  const [error, setError] = useState<string | null>(null);
  const busy = useRef(false);
  const requests = useRef<Partial<Record<GrammarSessionMode, string>>>({});

  async function start(mode: GrammarSessionMode) {
    if (busy.current) return;
    busy.current = true;
    setPending(mode);
    setError(null);
    try {
      const requestId = requests.current[mode] ?? crypto.randomUUID();
      requests.current[mode] = requestId;
      const result = await onStart({ noteId, requestId, mode });
      if (result.ok) {
        delete requests.current[mode];
        onOpen(result.data.id);
      } else setError(result.message);
    } catch {
      setError("연습을 준비하지 못했습니다. 다시 시도해 주세요.");
    } finally {
      busy.current = false;
      setPending(null);
    }
  }

  return (
    <section aria-label="연습 모드 선택" className="space-y-5">
      <div className="grid gap-5 md:grid-cols-2">
        {modes.map(({ mode, title, label, description }) => (
          <article
            key={mode}
            className="flex flex-col rounded-2xl border border-practice-line bg-white p-7 shadow-practice-panel"
          >
            <p className="text-xs tracking-widest text-practice-muted">{label}</p>
            <h2 className="mt-5 text-2xl font-medium tracking-tight text-practice-ink">{title}</h2>
            <p className="mt-4 flex-1 text-sm leading-7 text-practice-secondary">{description}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              {activeSessions[mode] && (
                <button
                  type="button"
                  disabled={pending !== null}
                  onClick={() => onOpen(activeSessions[mode]!)}
                  className="min-h-11 rounded-md bg-practice-ink px-4 text-sm text-white disabled:opacity-50"
                >
                  {title} 이어하기
                </button>
              )}
              <button
                type="button"
                disabled={pending !== null}
                onClick={() => start(mode)}
                className="min-h-11 rounded-md border border-practice-input-line px-4 text-sm text-practice-ink transition-shadow hover:shadow-emphasize disabled:opacity-50 motion-reduce:transition-none"
              >
                {pending === mode ? "준비 중…" : `${title} 새로 시작`}
              </button>
            </div>
          </article>
        ))}
      </div>
      {error && (
        <p role="alert" className="text-sm text-practice-accent">
          {error} 같은 시작 버튼으로 다시 시도할 수 있어요.
        </p>
      )}
      <p className="text-xs leading-6 text-practice-muted">
        새로 시작하면 문장 순서가 바뀝니다. 이어하기는 저장한 순서와 답안을 유지합니다.
      </p>
    </section>
  );
}
