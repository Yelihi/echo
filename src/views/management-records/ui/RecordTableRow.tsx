"use client";

import { cva } from "class-variance-authority";
import { LockIcon, Repeat, Trash, Waves, FileWarning, UnlinkIcon } from "lucide-react";

import { cn } from "@/shared/utils/cn";
import { Button, Badge } from "@/shared/components";

import { RecordRowViewModel } from "@/views/management-records/models/view/RecordRowViewModel";
import type {
  RecordUIPresentation,
  RecordStatus,
} from "@/views/management-records/models/interface";

interface RecordTableRowProps {
  record: RecordUIPresentation;
  first: boolean;
  last: boolean;
  pending?: boolean;
  onDelete?: () => void;
}

const recordTableRowVariants = cva(
  "w-full p-[12px] flex flex-wrap gap-3 justify-between items-center bg-white border-b border-gray-border",
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
        <div className="size-[40px] rounded-control flex justify-center items-center bg-gray-background">
          <Waves className="size-[19px] text-gray-text" />
        </div>
      );
    }
    case "delete-failed": {
      return (
        <div className="size-[40px] rounded-control flex justify-center items-center bg-red-secondary">
          <FileWarning className="size-[19px] text-red-primary" />
        </div>
      );
    }
    case "orphaned": {
      return (
        <div className="size-[40px] rounded-control flex justify-center items-center bg-yellow-secondary">
          <UnlinkIcon className="size-[19px] text-yellow-primary" />
        </div>
      );
    }
  }
}

export function RecordTableRow({ record, first, last, pending, onDelete }: RecordTableRowProps) {
  const viewModel = new RecordRowViewModel(record);

  const badge = viewModel.badge();

  const info = [
    record.fileSize,
    record.createdAt,
    record.inSession ? `세션 ${record.inSession}` : "",
  ].filter(Boolean);

  return (
    <div className={cn(recordTableRowVariants({ first, last }))}>
      <div className="flex min-w-0 flex-1 justify-start items-center gap-3">
        <div className="shrink-0">
          <LeftSideIcon status={record.status} />
        </div>
        <div className="flex flex-col items-start justify-start gap-[5px] min-w-0 w-full">
          <div className="flex min-w-0 flex-wrap items-center gap-1">
            <p className="break-all text-body-3 font-semibold text-black-primary">{record.name}</p>
            <Badge theme={badge.theme} value={badge.label} size="small">
              {badge.label}
            </Badge>
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            {info.map((value, index) => (
              <p
                key={`${value}-${index}`}
                className="break-all text-body-1 text-gray-text font-normal"
              >
                {value}
              </p>
            ))}
          </div>
        </div>
      </div>
      <div className="w-fit">
        <Button
          variant="outline"
          disabled={record.status === "connected" || pending || !onDelete}
          onClick={onDelete}
          aria-label={`${record.name} ${record.status === "connected" ? "보호됨" : "삭제"}`}
          className="border-gray-border text-black-primary"
        >
          {record.status === "connected" ? (
            <LockIcon aria-hidden className="size-3.5" />
          ) : record.status === "delete-failed" ? (
            <Repeat aria-hidden className="size-3.5" />
          ) : (
            <Trash aria-hidden className="size-3.5" />
          )}
          {record.status === "connected"
            ? "보호됨"
            : pending
              ? "삭제 중…"
              : record.status === "delete-failed"
                ? "재삭제"
                : "삭제"}
        </Button>
      </div>
    </div>
  );
}
