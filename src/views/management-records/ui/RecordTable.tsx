"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ConfirmDialog } from "@/shared/components/ui/ConfirmDialog";
import { deleteManagedRecording } from "../services/action/deleteManagedRecording";

import { RecordTableRow } from "@/views/management-records/ui/RecordTableRow";

import type { RecordUIPresentation } from "@/views/management-records/models/interface";

interface RecordTableProps {
  records: RecordUIPresentation[];
}

export function RecordTable({ records }: RecordTableProps) {
  const router = useRouter();
  const [selected, setSelected] = useState<RecordUIPresentation | null>(null);
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const [failed, setFailed] = useState(false);

  function removeSelected() {
    if (!selected || pending) return;
    const record = selected;
    startTransition(async () => {
      setMessage("");
      try {
        const result = await deleteManagedRecording(record.id);
        const success = result.code === "SUCCESS";
        setFailed(!success);
        setMessage(
          success
            ? "녹음 파일을 삭제했습니다."
            : "삭제하지 못했습니다. 연결 상태를 확인하고 다시 시도해 주세요.",
        );
      } catch {
        setFailed(true);
        setMessage("삭제 요청에 실패했습니다. 다시 시도해 주세요.");
      }
      router.refresh();
    });
  }

  return (
    <section aria-label="녹음 파일 목록" aria-busy={pending} className="w-full space-y-3">
      <p role={failed ? "alert" : "status"} className="text-body-3 text-black-primary">
        {message}
      </p>
      <div className="shadow-emphasize rounded-card">
        {records.map((record, index) => (
          <RecordTableRow
            key={record.id}
            record={record}
            first={index === 0}
            last={index === records.length - 1}
            pending={pending}
            onDelete={() => setSelected(record)}
          />
        ))}
      </div>
      <ConfirmDialog
        open={selected !== null}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
        tone="danger"
        title="미채택 녹음을 삭제할까요?"
        description={`${selected?.name ?? ""} 파일이 영구 삭제됩니다. 이 작업은 되돌릴 수 없습니다.`}
        confirmLabel="삭제"
        cancelLabel="취소"
        onConfirm={removeSelected}
      />
    </section>
  );
}
