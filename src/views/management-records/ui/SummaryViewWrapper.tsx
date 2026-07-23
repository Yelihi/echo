import { Suspense } from "react";

import SummaryDataView from "@/views/management-records/ui/SummaryDataView";

export async function SummaryViewWrapper() {
  // TODO : await 로 서버에서 데이터 가져오기

  const mock = {
    count: {
      total: 7,
      connected: 3,
      failDelete: 1,
      orphaned: 3,
    },
  };

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SummaryDataView recordsSummary={mock.count} />
    </Suspense>
  );
}
