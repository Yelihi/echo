"use client";

import { BookOpen, X } from "lucide-react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
  DialogFooter,
} from "@/shared/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { GlassButton } from "./RecordingControls";
import type { RecordingPreviewDialogProps } from "@/views/recording/models/ui";

export function RecordingPreviewDialog({ content }: RecordingPreviewDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <GlassButton>
          <BookOpen aria-hidden="true" />
          {content.previewLabel}
        </GlassButton>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader className="justify-between">
          <div className="min-w-0 text-left">
            <DialogTitle>{content.previewLabel}</DialogTitle>
            <DialogDescription className="mt-1 break-words">{content.title}</DialogDescription>
          </div>
          <DialogClose asChild>
            <Button variant="ghost" size="icon" aria-label="미리보기 닫기">
              <X />
            </Button>
          </DialogClose>
        </DialogHeader>
        <div className="min-h-0 overflow-y-auto px-6 py-2 text-left">
          {content.previewLines.length ? (
            <ol className="divide-y divide-card-line">
              {content.previewLines.map((line, index) => (
                <li key={index} className="py-4">
                  <p className="mb-2 text-body-2 font-bold text-gray-text">
                    {index + 1}. {line.label}
                  </p>
                  <p
                    lang="en"
                    className="whitespace-pre-wrap break-words text-body-4 text-black-primary"
                  >
                    {line.text}
                  </p>
                </li>
              ))}
            </ol>
          ) : (
            <p className="py-6 text-body-2 text-gray-text">미리 볼 문장이 없습니다.</p>
          )}
        </div>
        <DialogFooter className="justify-end">
          <DialogClose asChild>
            <Button variant="outline">닫기</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
