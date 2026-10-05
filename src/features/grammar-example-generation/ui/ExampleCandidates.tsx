"use client";
import { useShallow } from "zustand/react/shallow";
import { useExamples } from "./ExampleProvider";
import { ExampleCandidateCard } from "./ExampleCandidateCard";
export function ExampleCandidates() {
  const ids = useExamples(useShallow((s) => s.candidates.map((candidate) => candidate.id)));
  return (
    <div className="space-y-5">
      {ids.map((id, index) => (
        <ExampleCandidateCard key={id} id={id} number={index + 1} />
      ))}
    </div>
  );
}
