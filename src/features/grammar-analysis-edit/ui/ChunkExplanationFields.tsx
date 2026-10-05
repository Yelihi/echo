"use client";

import { useId } from "react";
import type { ChunkEditorProps } from "../models/interface";
import { Input } from "@/shared/components/atomics/input/Input";
import { Textarea } from "@/shared/components/atomics/textarea/Textarea";

export function ChunkExplanationFields({ chunk }: ChunkEditorProps) {
  const id = useId();
  return (
    <>
      <label className="block space-y-2" htmlFor={`${id}-meaning`}>
        직독직해
        <Input id={`${id}-meaning`} name="literalMeaning" defaultValue={chunk.literalMeaning} />
      </label>
      <label className="block space-y-2" htmlFor={`${id}-explanation`}>
        구간 설명
        <Textarea id={`${id}-explanation`} name="explanation" defaultValue={chunk.explanation} />
      </label>
    </>
  );
}
