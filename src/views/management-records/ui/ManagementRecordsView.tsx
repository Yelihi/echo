import { mockRecords, mockRecordsSummary } from "@/views/management-records/config/mock";
import { RecordTable } from "@/views/management-records/ui/RecordTable";
import SummaryDataView from "@/views/management-records/ui/SummaryDataView";

export function ManagementRecordsView() {
  return (
    <section className="flex w-full flex-col gap-7">
      <header className="flex flex-col gap-1.5">
        <h1 className="text-heading-md font-bold text-black-primary">녹음 관리</h1>
        <p className="text-body-4 text-gray-text">
          저장된 녹음 파일의 연결 상태와 정리 대상 파일을 확인하세요.
        </p>
      </header>

      <SummaryDataView recordsSummary={mockRecordsSummary} />
      <RecordTable records={mockRecords} />
    </section>
  );
}
