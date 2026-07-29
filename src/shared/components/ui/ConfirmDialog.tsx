"use client";

import * as React from "react";

import { Button } from "@/shared/components/atomics/button/Button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/components/ui/alert-dialog";
import { cn } from "@/shared/lib/tailwind/utils";

export type ConfirmDialogTone = "default" | "danger";

/**
 * tone 이 고르는 것은 클래스가 아니라 Button 의 variant 라서 cva 가 아닌 조회 테이블입니다.
 */
const confirmButtonVariant = {
  default: "default",
  danger: "destructive",
} as const satisfies Record<ConfirmDialogTone, "default" | "destructive">;

export interface ConfirmDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** danger 면 확인 버튼이 destructive 로 바뀝니다. */
  tone?: ConfirmDialogTone;
  title: React.ReactNode;
  description?: React.ReactNode;
  confirmLabel: React.ReactNode;
  cancelLabel: React.ReactNode;
  onConfirm?: () => void;
  onCancel?: () => void;
  className?: string;
}

/**
 * 확인 다이얼로그.
 *
 * 제어 컴포넌트입니다 — 열림 상태는 호출자가 소유합니다.
 * 확인/취소 버튼은 Radix 규약상 누르면 자동으로 닫히므로, 비동기 처리 중
 * 대기 상태가 필요하면 그 로직은 feature 레이어에서 갖고 있어야 합니다.
 */
export const ConfirmDialog = ({
  open,
  onOpenChange,
  tone = "default",
  title,
  description,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
  className,
}: ConfirmDialogProps) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent
        data-slot="confirm-dialog"
        data-tone={tone}
        className={cn(
          "w-full max-w-105 gap-2 rounded-card border-card-line p-6.5 shadow-modal",
          className,
        )}
      >
        <AlertDialogHeader className="gap-2">
          <AlertDialogTitle className="font-bold text-black-primary">{title}</AlertDialogTitle>
          {description ? (
            <AlertDialogDescription className="text-gray-text">
              {description}
            </AlertDialogDescription>
          ) : null}
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-row gap-2.5 pt-3.5">
          <AlertDialogCancel asChild>
            <Button variant="ghost" size="lg" className="flex-1" onClick={onCancel}>
              {cancelLabel}
            </Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button
              variant={confirmButtonVariant[tone]}
              size="lg"
              className="flex-1"
              onClick={onConfirm}
            >
              {confirmLabel}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
