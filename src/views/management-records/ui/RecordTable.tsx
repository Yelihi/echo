import { RecordTableRow } from "@/views/management-records/ui/RecordTableRow";

import type { RecordUIPresentation } from "@/views/management-records/models/interface";

interface RecordTableProps {
  records: RecordUIPresentation[];
}

export function RecordTable({ records }: RecordTableProps) {
  return (
    <section className="size-fit shadow-md rounded-[20px] w-full">
      {records.map((record, index) => (
        <RecordTableRow
          key={record.id}
          record={record}
          first={index === 0}
          last={index === records.length - 1}
        />
      ))}
    </section>
  );
}
