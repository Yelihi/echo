"use client";
import type { RecordingReadyPanelProps } from "@/views/recording/models/ui";

import { Play } from "lucide-react";
import { RecordingPreviewDialog } from "./RecordingPreviewDialog";

import { GlassButton } from "@/views/recording/ui/common/RecordingControls";

export function RecordingReadyPanel({ content, onStart }: RecordingReadyPanelProps) {
  const { label, title, description, meta } = content;
  return (
    <section className="absolute inset-0 flex items-center justify-center px-5 pt-20 text-center">
      <div className="flex max-w-[560px] flex-col items-center gap-5">
        <span className="inline-flex h-[27px] items-center rounded-full bg-accent-50 px-3 text-body-1 font-bold text-accent-700">
          {label}
        </span>
        <h1 className="text-heading-lg font-bold text-white">{title}</h1>
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
