import type { ReactNode } from "react";
import { Sparkles } from "lucide-react";

import { SessionSimplified } from "@/widgets/latest-sessions/ui/SessionSimplified";
import { getLatestStudySessions } from "@/views/home/services/getLatestStudySessions";

function EmptyColorMark() {
  return (
    <span className="relative block size-[48px]" aria-hidden>
      <span className="absolute top-0 left-0 size-[34px] rounded-[14px] bg-blue-secondary" />
      <span className="absolute right-0 bottom-0 size-[28px] rounded-full bg-yellow-secondary" />
      <span className="absolute top-[14px] left-[14px] size-[22px] rounded-chip bg-deep-blue-secondary" />
      <Sparkles className="absolute top-[2px] right-[2px] size-[14px] text-yellow-primary" />
      <Sparkles className="absolute bottom-[8px] left-[8px] size-[12px] text-blue-primary" />
    </span>
  );
}

function EmptyContainer({
  title,
  description,
  icon = <EmptyColorMark />,
}: {
  title: string;
  description?: string;
  icon?: ReactNode;
}) {
  return (
    <div
      className="flex w-full flex-col items-center justify-center gap-[8px] rounded-panel border border-gray-border bg-white py-[40px]"
      role="status"
    >
      {icon}
      <p className="text-body-3 font-medium text-black-primary">{title}</p>
      {description ? (
        <p className="text-body-1 font-normal text-gray-text-secondary">{description}</p>
      ) : null}
    </div>
  );
}

export async function HomeLatestStudyRecordList() {
  const latestFiveSessions = await getLatestStudySessions();

  if (latestFiveSessions.length === 0) {
    return (
      <EmptyContainer
        title="아직 학습 기록이 없어요"
        description="롤플레이나 암기를 시작하면 여기에 나타나요."
      />
    );
  }

  return (
    <div className="flex w-full flex-col gap-2.5">
      {latestFiveSessions.map((session) => (
        <SessionSimplified key={session.id} {...session} />
      ))}
    </div>
  );
}
