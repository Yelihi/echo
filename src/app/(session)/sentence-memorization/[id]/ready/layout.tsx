import Link from "next/link";

export default function SentenceMemorizationReadyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div data-pillar="memo">
      <Link
        href="/sentence-memorization"
        aria-label="문장 암기 목록으로 돌아가기"
        className="mb-[18px] inline-flex h-7 items-center gap-1 rounded-lg px-2.5 text-body-2 font-medium text-black-secondary hover:bg-wash-6"
      >
        <span aria-hidden="true">←</span>
        암기 자료
      </Link>
      <div className="flex flex-col gap-[26px]">{children}</div>
    </div>
  );
}
