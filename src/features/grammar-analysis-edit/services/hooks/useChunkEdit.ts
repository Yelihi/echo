"use client";

import { useRef, useState } from "react";
import type { AnalysisEdit } from "../../models/editAnalysis";
import { useAnalysisEditor } from "../../ui/AnalysisEditorProvider";

export function useChunkEdit(chunkId: string) {
  const formRef = useRef<HTMLFormElement>(null);
  const edit = useAnalysisEditor((state) => state.edit);
  const [error, setError] = useState("");

  function applyEdit(command?: AnalysisEdit) {
    if (!formRef.current) return;
    // 풀이는 적용 시에만 필요하다. 입력값을 DOM과 React state에 중복 저장하지 않는다.
    const data = new FormData(formRef.current);
    const literalMeaning = String(data.get("literalMeaning") ?? "");
    const explanation = String(data.get("explanation") ?? "");
    const result = edit([
      (service) => service.editChunk(chunkId, { literalMeaning, explanation }),
      ...(command ? [command] : []),
    ]);
    setError(result.ok ? "" : result.message);
  }

  return { formRef, applyEdit, error };
}
