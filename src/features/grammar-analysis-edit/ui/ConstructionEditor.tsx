"use client";

import type { ConstructionEditorProps } from "../models/interface";

import { useId, useState } from "react";
import { Input } from "@/shared/components/atomics/input/Input";
import { Textarea } from "@/shared/components/atomics/textarea/Textarea";
import { Button } from "@/shared/components/atomics/button/Button";
import { RangeFields } from "./RangeFields";
import { useAnalysisEditor } from "./AnalysisEditorProvider";

export function ConstructionEditor({ annotation }: ConstructionEditorProps) {
  const id = useId();
  const [draft, setDraft] = useState(annotation);
  const [error, setError] = useState("");
  const source = useAnalysisEditor((state) => state.analysis.sourceText);
  const markDirty = useAnalysisEditor((state) => state.markDirty);
  const edit = useAnalysisEditor((state) => state.edit);
  return (
    <form
      className="space-y-5"
      onSubmit={(e) => {
        e.preventDefault();
        const result = edit({ type: "save-construction", annotation: draft });
        setError(result.ok ? "" : result.message);
      }}
    >
      <h3 className="text-lg">{annotation.name}</h3>
      <RangeFields
        ranges={draft.ranges}
        source={source}
        onChange={(ranges) => {
          markDirty();
          setDraft({ ...draft, ranges });
        }}
      />
      <label htmlFor={`${id}-meaning`} className="block space-y-2">
        구문 뜻
        <Input
          id={`${id}-meaning`}
          value={draft.meaning}
          onChange={(e) => setDraft({ ...draft, meaning: e.target.value })}
        />
      </label>
      <label htmlFor={`${id}-explanation`} className="block space-y-2">
        구문 설명
        <Textarea
          id={`${id}-explanation`}
          value={draft.explanation}
          onChange={(e) => setDraft({ ...draft, explanation: e.target.value })}
        />
      </label>
      <Button type="submit">구문 수정 적용</Button>
      {error && (
        <p role="alert" className="text-sm text-danger-ink">
          {error}
        </p>
      )}
    </form>
  );
}
