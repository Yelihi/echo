"use client";

import { cva } from "class-variance-authority";
import { LockIcon, Repeat, Trash, Waves, FileWarning, UnlinkIcon } from "lucide-react";

import { cn } from "@/shared/utils/cn";
import { Button, Badge } from "@/shared/components";

import { RecordRowViewModel } from "@/views/management-records/models/view/RecordRowViewModel";
import type {
  RecordUIPresentation,
  RecordingAction,
  RecordStatus,
} from "@/views/management-records/models/interface";

interface RecordTableRowProps {
  record: RecordUIPresentation;
  first: boolean;
  last: boolean;
}

const recordTableRowVariants = cva(
  "w-full p-[12px] flex justify-between items-center bg-white border-b border-gray-border",
  {
    variants: {
      first: {
        true: "rounded-t-[20px]",
        false: "",
      },
      last: {
        true: "rounded-b-[20px] border-b-0",
        false: "",
      },
    },
  },
);

export function LeftSideIcon({ status }: { status: RecordStatus }) {
  switch (status) {
    case "connected": {
      return (
        <div className="size-[40px] rounded-[12px] flex justify-center items-center bg-gray-background">
          <Waves className="size-[19px] text-gray-text" />
        </div>
      );
    }
    case "delete-failed": {
      return (
        <div className="size-[40px] rounded-[12px] flex justify-center items-center bg-red-secondary">
          <FileWarning className="size-[19px] text-red-primary" />
        </div>
      );
    }
    case "orphaned": {
      return (
        <div className="size-[40px] rounded-[12px] flex justify-center items-center bg-yellow-secondary">
          <UnlinkIcon className="size-[19px] text-yellow-primary" />
        </div>
      );
    }
  }
}

export function ActionButton({ recordId, action }: { recordId: string; action: RecordingAction }) {
  switch (action.type) {
    case "connected": {
      return (
        <Button
          variant="outline"
          className="border-gray-border text-gray-text-secondary"
          disabled={action.disabled}
        >
          <LockIcon className="size-[14px] text-gray-text-secondary" /> 보호됨
        </Button>
      );
    }
    case "delete-failed": {
      return (
        <Button
          variant="outline"
          className="border-gray-border text-red-primary"
          onClick={() => action.action(recordId)}
        >
          <Repeat className="size-[14px] text-red-primary" />
          재삭제
        </Button>
      );
    }
    case "orphaned": {
      return (
        <Button
          variant="outline"
          className="border-gray-border text-red-primary"
          onClick={() => action.action(recordId)}
        >
          <Trash className="size-[14px] text-red-primary" />
          연결 끊기
        </Button>
      );
    }
  }
}

export function RecordTableRow({ record, first, last }: RecordTableRowProps) {
  const viewModel = new RecordRowViewModel(record);

  const actionButton = viewModel.actionButton();
  const badge = viewModel.badge();

  const info = [
    record.fileSize,
    record.createdAt,
    record.inSession ? `${record.inSession}세션` : "",
  ].filter(Boolean);

  return (
    <div className={cn(recordTableRowVariants({ first, last }))}>
      <div className="flex justify-start items-center gap-[12px]">
        <div className="size-fit">
          <LeftSideIcon status={record.status} />
        </div>
        <div className="flex flex-col items-start justify-start gap-[5px] w-full">
          <div className="flex justify-start items-center gap-[5px]">
            <p className="text-body-3 font-semibold text-black-primary">{record.name}</p>
            <Badge theme={badge.theme} value={badge.label} size="small">
              {badge.label}
            </Badge>
          </div>
          <div className="flex justify-start items-center gap-[2px]">
            {info.map((value, index) => (
              <p
                key={`${value}-${index}`}
                className="text-body-1 text-gray-text-secondary font-normal"
              >
                {value}
              </p>
            ))}
          </div>
        </div>
      </div>
      <div className="w-fit">
        <ActionButton recordId={record.id} action={actionButton} />
      </div>
    </div>
  );
}
