import { Suspense } from "react";
import { redirect } from "next/navigation";
import { PageContainer } from "@/widgets/app-shell";
import {
  ManagementRecordsView,
  ManagementRecordsSkeleton,
} from "@/views/management-records/ui/ManagementRecordsView";
import { getRecordingManagementPage } from "@/views/management-records/services/server/getRecordingManagementPage";
import {
  parseRecordingManagementQuery,
  recordingManagementHref,
  type RecordingManagementQuery,
} from "@/views/management-records/models/query";

async function RecordingContent({ query }: { query: RecordingManagementQuery }) {
  const data = await getRecordingManagementPage(query);
  if (data.page !== query.page) redirect(recordingManagementHref({ ...query, page: data.page }));
  return <ManagementRecordsView {...data} query={query} />;
}

export default async function RecordingManagementPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = parseRecordingManagementQuery(await searchParams);
  return (
    <PageContainer>
      <Suspense
        key={`${query.page}-${query.status}-${query.sort}`}
        fallback={<ManagementRecordsSkeleton />}
      >
        <RecordingContent query={query} />
      </Suspense>
    </PageContainer>
  );
}
