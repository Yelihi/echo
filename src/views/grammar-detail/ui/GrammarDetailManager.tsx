"use client";
import { createContext, useContext, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import type { GrammarNote } from "@/entities/grammar-note";
import { GrammarExampleManager } from "@/features/grammar-example-generation";
import {
  requestGrammarExamples,
  saveGrammarExamples,
} from "@/features/grammar-example-generation/services/actions/exampleActions";
const ManageContext = createContext<(() => void) | null>(null);
export function GrammarDetailManager({
  note,
  children,
}: {
  note: GrammarNote;
  children: ReactNode;
}) {
  const [managing, setManaging] = useState(false);
  const router = useRouter();
  return (
    <ManageContext.Provider value={() => setManaging(true)}>
      {managing ? (
        <div className="mx-auto max-w-5xl px-5 py-8 sm:px-8">
          <div className="rounded-2xl border border-practice-line bg-white p-6 sm:p-8">
            <GrammarExampleManager
              note={note}
              generate={requestGrammarExamples}
              save={saveGrammarExamples}
              onUpdated={() => router.refresh()}
              onBack={() => setManaging(false)}
            />
          </div>
        </div>
      ) : (
        children
      )}
    </ManageContext.Provider>
  );
}
export function GrammarManageExamplesButton() {
  const manage = useContext(ManageContext);
  if (!manage) throw new Error("GrammarDetailManager가 필요합니다.");
  return (
    <button
      type="button"
      onClick={manage}
      className="min-h-11 rounded-md border border-practice-input-line px-4 text-sm text-practice-body hover:bg-practice-chip"
    >
      예문 생성·검토
    </button>
  );
}
