"use client";

import { Button } from "@/shared/components";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/components/ui";

interface ErrorAlertDialogProps {
  readonly open: boolean;
  readonly title: string;
  readonly message: string;
  readonly code?: string;
  readonly onConfirm: () => void;
}

export function ErrorAlertDialog({ open, title, message, code, onConfirm }: ErrorAlertDialogProps) {
  return (
    <AlertDialog open={open}>
      <AlertDialogContent onEscapeKeyDown={(event) => event.preventDefault()}>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{message}</AlertDialogDescription>
        </AlertDialogHeader>
        {code ? <p className="text-body-2 text-gray-text">오류 코드: {code}</p> : null}
        <AlertDialogFooter>
          <AlertDialogAction asChild>
            <Button type="button" onClick={onConfirm}>
              확인
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
