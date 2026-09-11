import { PageContainer } from "@/widgets/app-shell";
import { ManagementRecordsSkeleton } from "@/views/management-records/ui/ManagementRecordsView";

export default function Loading() {
  return (
    <PageContainer>
      <ManagementRecordsSkeleton />
    </PageContainer>
  );
}
