"use client";
import type { RecordingReadyPanelProps } from "@/views/recording/models/ui";

import { Play } from "lucide-react";
import { RecordingPreviewDialog } from "./RecordingPreviewDialog";

import { GlassButton } from "@/views/recording/ui/common/RecordingControls";

export function RecordingReadyPanel({ content, onStart }: RecordingReadyPanelProps) {
  const { label, title, description, meta } = content;
  return (
    <section className="relative flex min-h-[calc(100svh-5rem)] items-center justify-center px-page-gutter py-12 text-center">
      <div className="flex w-full max-w-2xl flex-col items-center gap-5">
        <span className="inline-flex h-[27px] items-center rounded-full bg-accent-50 px-3 text-body-1 font-bold text-accent-700">
          {label}
        </span>
        <h1 className="text-heading-lg font-bold tracking-tight break-words text-white">{title}</h1>
        <div className="text-body-5 text-white/62">
          {description.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
        <div className="flex flex-wrap justify-center gap-2.5">
          {meta.map((item) => (
            <span
              key={item}
              className="inline-flex h-[27px] items-center rounded-full border border-card-line-strong px-3 text-body-1 font-bold text-white"
            >
              {item}
            </span>
          ))}
        </div>
        <div className="flex flex-wrap justify-center gap-2.5 pt-5">
          <RecordingPreviewDialog content={content} />
          <GlassButton emphasis="primary" onClick={onStart}>
            <Play />
            시작하기
          </GlassButton>
        </div>
      </div>
    </section>
  );
}
