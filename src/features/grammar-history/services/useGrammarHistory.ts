"use client";
import { useEffect, useRef, useState } from "react";
import type { GrammarHistoryProps } from "../models/interface";
export function useGrammarHistory({ noteId, initialData, load }: GrammarHistoryProps) {
  const [data, setData] = useState(initialData);
  const [latestCompletedAt, setLatestCompletedAt] = useState(
    initialData?.page === 1 ? initialData.items[0]?.completedAt : undefined,
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const generation = useRef(0);
  useEffect(() => {
    const lifecycle = generation;
    return () => {
      lifecycle.current++;
    };
  }, []);
  async function refresh(page = 1) {
    const currentGeneration = ++generation.current;
    setBusy(true);
    setError("");
    try {
      const result = await load(noteId, page);
      if (currentGeneration !== generation.current) return;
      if (result.ok) {
        setData(result.data);
        if (result.data.page === 1) setLatestCompletedAt(result.data.items[0]?.completedAt);
      } else setError(result.message);
    } catch {
      if (currentGeneration === generation.current) setError("연습 기록을 불러오지 못했습니다.");
    } finally {
      if (currentGeneration === generation.current) setBusy(false);
    }
  }
  return { data, latestCompletedAt, busy, error, refresh };
}
