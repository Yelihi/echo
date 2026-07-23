import { Folder, LucideLink, LucideFileWarning, LucideUnlink } from "lucide-react";

import { cn } from "@/shared/utils/cn";

import type {
  RecordSummaryCardProps,
  SummaryDataViewProps,
} from "@/views/management-records/models/interface";

function RecordSummaryCard({ count, title, children }: RecordSummaryCardProps) {
  return (
    <div className="rounded-[16px] w-full py-[16px] px-[18px] flex justify-start items-center gap-[10px] bg-white border border-gray-border rounded-[10px]">
      {children}
      <div className="flex flex-col items-start justify-start gap-[3px]">
        <p className="text-heading-sm font-extrabold text-black-primary">{count}</p>
        <p className="text-body-1 font-normal text-gray-text">{title}</p>
      </div>
    </div>
  );
}

function RecordIconContainer({ className, children }: React.HTMLAttributes<"div">) {
  return (
    <div className={cn("flex justify-center items-center size-[40px] rounded-[11px]", className)}>
      {children}
    </div>
  );
}

// 해당 컴포넌트 내에서 데이터를 서버에서 받아와 그대로 렌더링
// Loading 은 추후 skeleton 처리 예정
function SummaryDataView({ recordsSummary }: SummaryDataViewProps) {
  return (
    <section className="w-full grid grid-cols-1 gap-[15px] md:grid-cols-2 lg:grid-cols-4">
      <RecordSummaryCard count={recordsSummary.total} title="전체 파일">
        <RecordIconContainer className="bg-gray-background">
          <Folder className="size-[20px] text-gray-text" />
        </RecordIconContainer>
      </RecordSummaryCard>
      <RecordSummaryCard count={recordsSummary.connected} title="정상 연결">
        <RecordIconContainer className="bg-green-secondary">
          <LucideLink className="size-[20px] text-green-primary" />
        </RecordIconContainer>
      </RecordSummaryCard>
      <RecordSummaryCard count={recordsSummary.failDelete} title="삭제 실패">
        <RecordIconContainer className="bg-red-secondary">
          <LucideFileWarning className="size-[20px] text-red-primary" />
        </RecordIconContainer>
      </RecordSummaryCard>
      <RecordSummaryCard count={recordsSummary.orphaned} title="orphan 파일">
        <RecordIconContainer className="bg-yellow-secondary">
          <LucideUnlink className="size-[20px] text-yellow-primary" />
        </RecordIconContainer>
      </RecordSummaryCard>
    </section>
  );
}

export default SummaryDataView;
