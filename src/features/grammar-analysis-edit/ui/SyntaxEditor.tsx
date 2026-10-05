"use client";

import type { SyntaxEditorProps } from "../models/interface";

import { useId, useState } from "react";
import type { SyntaxRole } from "@/entities/grammar-note";
import { Input } from "@/shared/components/atomics/input/Input";
import { Textarea } from "@/shared/components/atomics/textarea/Textarea";
import { Button } from "@/shared/components/atomics/button/Button";
import { RangeFields } from "./RangeFields";
import { useAnalysisEditor } from "./AnalysisEditorProvider";

const roles: { value: SyntaxRole; label: string }[] = [
  { value: "subject", label: "주어" },
  { value: "verb", label: "동사" },
  { value: "object", label: "목적어" },
  { value: "complement", label: "보어" },
  { value: "modifier", label: "수식어" },
  { value: "other", label: "절·기타" },
];

export function SyntaxEditor({ annotation }: SyntaxEditorProps) {
  const id = useId();
  const [draft, setDraft] = useState(annotation);
  const [error, setError] = useState("");
  const markDirty = useAnalysisEditor((state) => state.markDirty);
  const edit = useAnalysisEditor((state) => state.edit);
  const syntax = useAnalysisEditor((state) => state.analysis.syntax);
  const source = useAnalysisEditor((state) => state.analysis.sourceText);
  return (
    <form
      className="space-y-5"
      onSubmit={(e) => {
        e.preventDefault();
        const result = edit({ type: "save-syntax", annotation: draft });
        setError(result.ok ? "" : result.message);
      }}
    >
      <label htmlFor={`${id}-label`} className="block space-y-2">
        역할 이름
        <Input
          id={`${id}-label`}
          value={draft.label}
          onChange={(e) => setDraft({ ...draft, label: e.target.value })}
        />
      </label>
      <fieldset className="flex flex-wrap gap-3">
        <legend className="mb-2">문장 성분</legend>
        {roles.map((role) => (
          <label key={role.value} className="flex items-center gap-1 text-sm">
            <input
              type="radio"
              name={`${id}-role`}
              checked={draft.role === role.value}
              onChange={() => setDraft({ ...draft, role: role.value })}
            />
            {role.label}
          </label>
        ))}
      </fieldset>
      <label htmlFor={`${id}-parent`} className="block space-y-2">
        상위 항목
        <select
          id={`${id}-parent`}
          value={draft.parentId ?? ""}
          onChange={(e) => setDraft({ ...draft, parentId: e.target.value || null })}
          className="block h-12 w-full rounded-md border border-practice-input-line bg-white px-3"
        >
          <option value="">최상위</option>
          {syntax
            .filter((item) => item.id !== annotation.id)
            .map((item) => (
              <option key={item.id} value={item.id}>
                {item.label} ·{" "}
                {item.ranges.map((range) => source.slice(range.start, range.end)).join(" … ")}
              </option>
            ))}
        </select>
      </label>
      <RangeFields
        ranges={draft.ranges}
        source={source}
        onChange={(ranges) => {
          markDirty();
          setDraft({ ...draft, ranges });
        }}
      />
      <label htmlFor={`${id}-explanation`} className="block space-y-2">
        문법 설명
        <Textarea
          id={`${id}-explanation`}
          value={draft.explanation}
          onChange={(e) => setDraft({ ...draft, explanation: e.target.value })}
        />
      </label>
      <div className="flex gap-3">
        <Button type="submit">문법 수정 적용</Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => {
            const result = edit({ type: "delete-syntax", id: annotation.id });
            setError(result.ok ? "" : result.message);
          }}
        >
          항목 삭제
        </Button>
      </div>
      {error && (
        <p role="alert" className="text-sm text-danger-ink">
          {error}
        </p>
      )}
    </form>
  );
}
