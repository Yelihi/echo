"use client";
import { useState } from "react";
import type { GrammarExample } from "@/entities/grammar-note";

export function ExampleTranslation({ example }: { example: GrammarExample }) {
  const [direct, setDirect] = useState(false);

  if (!example.directReading) {
    return <p className="text-sm leading-7 text-practice-secondary">{example.translation}</p>;
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        aria-pressed={direct}
        onClick={() => setDirect((value) => !value)}
        className="min-h-11 rounded-md border border-practice-line px-3 text-sm text-practice-body hover:bg-practice-chip"
      >
        {direct ? "자연스러운 해석" : "직독직해"}
      </button>
      {direct ? (
        <div className="space-y-2 rounded-xl bg-practice-canvas p-4">
          {example.directReading.map((block) => (
            <div key={`${block.start}-${block.end}`} className="text-sm leading-7">
              <p lang="en" className="text-practice-ink">
                {example.sentence.slice(block.start, block.end)}
              </p>
              <p lang="ko" className="text-practice-secondary">
                {block.korean}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p lang="ko" className="text-sm leading-7 text-practice-secondary">
          {example.translation}
        </p>
      )}
    </div>
  );
}
