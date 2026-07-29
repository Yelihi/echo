"use client";

import * as React from "react";
import { FileText, Upload, X } from "lucide-react";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { cn } from "@/shared/lib/tailwind/utils";

export interface ImportDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  title: React.ReactNode;
  /** 헤더에 표시할 파일 이름 */
  filename?: React.ReactNode;
  /** 헤더 좌측 아이콘 */
  icon?: React.ReactNode;
  /**
   * 단계별 본문 슬롯.
   * 분석 중에는 LoadingState, 실패는 ErrorState, 미리보기는 목록을 넣습니다 —
   * 단계 판단과 문구는 호출자가 소유합니다.
   */
  children: React.ReactNode;
  /** 하단 액션 슬롯. 없으면 푸터가 그려지지 않습니다. */
  footer?: React.ReactNode;
  className?: string;
}

/**
 * 파일 가져오기 모달의 껍데기.
 *
 * 단계(분석 중 / 실패 / 미리보기)를 컴포넌트가 알지 않습니다.
 * 헤더·본문·푸터 자리만 제공하고 무엇을 넣을지는 호출자가 정합니다.
 */
export const ImportDialog = ({
  open,
  onOpenChange,
  title,
  filename,
  icon = <Upload />,
  children,
  footer,
  className,
}: ImportDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent data-slot="import-dialog" className={cn(className)}>
        <DialogHeader>
          <span className="flex size-10 shrink-0 items-center justify-center rounded-chip bg-blue-secondary text-blue-focus-title [&_svg]:size-5">
            {icon}
          </span>
          <div className="flex flex-1 flex-col gap-0.5">
            <DialogTitle>{title}</DialogTitle>
            {filename ? (
              <span className="flex items-center gap-1.5 text-body-2 text-gray-text [&_svg]:size-3.25">
                <FileText />
                {filename}
              </span>
            ) : null}
          </div>
          <DialogClose
            aria-label="닫기"
            className="inline-flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-chip text-gray-text transition-colors outline-none hover:bg-gray-background [&_svg]:size-5"
          >
            <X />
          </DialogClose>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">{children}</div>

        {footer ? <DialogFooter>{footer}</DialogFooter> : null}
      </DialogContent>
    </Dialog>
  );
};
