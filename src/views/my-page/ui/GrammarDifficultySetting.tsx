"use client";

import { useState } from "react";
import { LoaderCircle } from "lucide-react";
import type { GrammarDifficulty } from "@/entities/user-profile/models/entity";
import type { GrammarDifficultySettingProps } from "../models/interface";
import { saveGrammarDifficulty } from "../services/actions/saveGrammarDifficulty";

const options: readonly { value: GrammarDifficulty; label: string; description: string }[] = [
  { value: 1, label: "1단계 · 쉬움", description: "짧고 익숙한 표현" },
  { value: 2, label: "2단계 · 보통", description: "일상에서 쓰는 다양한 표현" },
  { value: 3, label: "3단계 · 도전", description: "더 풍부한 어휘와 문장" },
];

export function GrammarDifficultySetting({ initialDifficulty }: GrammarDifficultySettingProps) {
  const [selected, setSelected] = useState(initialDifficulty);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");

  async function save() {
    if (pending) return;
    setPending(true);
    setMessage("");
    try {
      const result = await saveGrammarDifficulty(selected);
      if (result.ok) {
        setMessage("예문 난이도를 저장했어요.");
      } else {
        setMessage(
          result.code === "UNAUTHORIZED"
            ? "로그인 후 다시 저장해 주세요."
            : "저장하지 못했어요. 다시 시도해 주세요.",
        );
      }
    } catch {
      setMessage("저장하지 못했어요. 다시 시도해 주세요.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        void save();
      }}
      className="mt-5 rounded-xl border border-practice-line bg-practice-canvas p-5"
    >
      <fieldset disabled={pending}>
        <legend className="text-[15px] font-medium text-practice-ink">예문 난이도</legend>
        <p className="mt-1 text-[13px] text-practice-subtle">
          다음에 생성할 어법 예문의 수준을 선택하세요.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {options.map((option) => (
            <label
              key={option.value}
              className="flex cursor-pointer items-start gap-3 rounded-lg border border-practice-line bg-white p-4 transition-colors hover:border-practice-accent has-checked:border-practice-accent has-checked:bg-practice-accent/5 has-disabled:cursor-not-allowed has-disabled:opacity-60"
            >
              <input
                type="radio"
                name="grammar-difficulty"
                value={option.value}
                checked={selected === option.value}
                onChange={() => {
                  setSelected(option.value);
                  setMessage("");
                }}
                className="mt-1 accent-practice-accent"
              />
              <span>
                <span className="block text-[14px] font-medium text-practice-ink">
                  {option.label}
                </span>
                <span className="mt-1 block text-[12px] text-practice-ink">
                  {option.description}
                </span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-practice-accent px-5 text-[13px] font-medium text-white transition-colors hover:bg-practice-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending && <LoaderCircle size={16} className="animate-spin" aria-hidden />}
          {pending ? "저장 중" : "설정 저장"}
        </button>
        {message && (
          <p
            role={message.includes("못했") || message.includes("로그인") ? "alert" : "status"}
            className="text-[13px] text-practice-subtle"
          >
            {message}
          </p>
        )}
      </div>
    </form>
  );
}
