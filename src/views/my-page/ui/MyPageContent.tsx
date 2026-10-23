import { Spinner } from "@/shared/components/atomics/spinner/Spinner";
import Link from "next/link";
import { ArrowRight, ChartNoAxesCombined, ChevronRight, CircleAlert } from "lucide-react";

import type {
  MyPageContentProps,
  MyPageSectionHeadingProps,
  MyPageMaterialRowsProps,
  PracticeStats,
} from "@/views/my-page/models/interface";

const emptyClassName = "flex min-h-41 items-center text-[14px] leading-[1.7] text-practice-subtle";

export function MyPageContent({
  roleplay,
  memorization,
  statistics,
  difficulty,
}: MyPageContentProps) {
  return (
    <div className="mx-auto max-w-[1280px] px-13 pt-12 pb-16 max-md:px-5.5 max-md:pt-7 max-md:pb-12">
      <header className="relative border-b border-practice-line pb-9">
        <p className="text-[10px] tracking-[0.16em] text-practice-muted">MY PRACTICE</p>
        <h1 className="mt-3.5 text-[36px] font-medium tracking-[-1px] max-md:text-[30px]">
          마이페이지
        </h1>
        <p className="mt-3 text-[14px] text-practice-muted">
          나의 자료와 쌓아온 연습을 한눈에 확인하세요.
        </p>
        <Link
          href="/recording-management"
          className="absolute right-0 bottom-10 inline-flex items-center gap-3.5 text-[13px] max-md:static max-md:mt-5"
        >
          녹음 관리 <ArrowRight size={16} aria-hidden />
        </Link>
      </header>
      <div className="grid grid-cols-3 border-b border-practice-line pt-7.75 pb-8 max-lg:grid-cols-1 max-lg:gap-6">
        <section aria-labelledby="my-page-roleplay" className="min-w-0 pr-10.5 max-lg:pr-0">
          <SectionHeading id="my-page-roleplay" title="최근 롤플레잉 자료" href="/role-playing" />
          {roleplay}
        </section>
        <section
          aria-labelledby="my-page-memorization"
          className="min-w-0 border-l border-practice-line px-10.5 max-lg:border-t max-lg:border-l-0 max-lg:px-0 max-lg:pt-6"
        >
          <SectionHeading
            id="my-page-memorization"
            title="최근 암기 자료"
            href="/sentence-memorization"
          />
          {memorization}
        </section>
        <section
          aria-labelledby="my-page-grammar"
          className="min-w-0 border-l border-practice-line pl-10.5 max-lg:border-t max-lg:border-l-0 max-lg:pl-0 max-lg:pt-6"
        >
          <SectionHeading id="my-page-grammar" title="어법 연습" href="/grammar" />
          <p className={emptyClassName}>저장한 어법 노트를 살펴보고 연습을 시작해보세요.</p>
        </section>
      </div>
      <section className="pt-7" aria-labelledby="my-page-statistics">
        <h2
          id="my-page-statistics"
          className="text-[20px] font-medium tracking-[-0.65px] max-md:text-[16px]"
        >
          연습 통계
        </h2>
        {statistics}
      </section>
      <section className="pt-8" aria-label="개인 설정">
        {difficulty}
      </section>
    </div>
  );
}

function SectionHeading({ id, title, href }: MyPageSectionHeadingProps) {
  return (
    <div className="mb-1.75 flex min-h-8.5 items-center justify-between gap-4">
      <h2
        id={id}
        className="text-[20px] leading-[1.5] font-medium tracking-[-0.65px] max-md:text-[16px]"
      >
        {title}
      </h2>
      <Link
        className="-my-1.25 flex min-h-11 shrink-0 items-center gap-3 text-[16px] text-practice-subtle max-md:gap-1.5 max-md:text-[12px]"
        href={href}
        aria-label={`${title} 전체 보기`}
      >
        전체 보기 <ArrowRight size={17} strokeWidth={1.5} aria-hidden />
      </Link>
    </div>
  );
}

export function MyPageMaterialRows({ items }: MyPageMaterialRowsProps) {
  if (!items.length)
    return (
      <p className={emptyClassName}>아직 자료가 없어요. 새 자료를 만들어 연습을 시작해보세요.</p>
    );
  return (
    <ul>
      {items.map((item) => (
        <li key={item.id} className="border-practice-line not-first:border-t">
          <Link href={item.href} className="group/material flex min-h-20.5 items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-[16px] leading-[1.5] tracking-[-0.3px] [overflow-wrap:anywhere] group-hover/material:underline group-hover/material:underline-offset-4 max-md:text-[14px]">
                {item.title}
              </p>
              <span className="block text-[14px] leading-[1.5] text-practice-subtle [overflow-wrap:anywhere]">
                {item.description}
              </span>
            </div>
            <time
              className="ml-auto text-[16px] whitespace-nowrap text-practice-subtle max-md:text-[12px]"
              dateTime={item.date.toISOString()}
            >
              {formatDate(item.date)}
            </time>
            <ChevronRight
              className="shrink-0 text-practice-subtle"
              size={17}
              strokeWidth={1.5}
              aria-hidden
            />
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function MyPageStatistics({ stats }: { stats: PracticeStats | null }) {
  if (!stats)
    return (
      <div
        role="alert"
        className="mt-5 flex items-start gap-3 rounded-xl border border-practice-line bg-practice-canvas px-5 py-6"
      >
        <CircleAlert size={20} className="shrink-0 text-practice-error" aria-hidden />
        <div>
          <p className="text-[15px] font-medium text-practice-ink">통계를 불러오지 못했어요</p>
          <p className="mt-1 text-[13px] text-practice-subtle">잠시 후 다시 시도해 주세요.</p>
        </div>
      </div>
    );
  if (stats.total === 0)
    return (
      <div className="mt-5 flex items-start gap-3 rounded-xl border border-practice-line bg-practice-canvas px-5 py-6">
        <ChartNoAxesCombined size={20} className="shrink-0 text-practice-accent" aria-hidden />
        <div>
          <p className="text-[15px] font-medium text-practice-ink">
            최근 30일 동안 완료한 연습이 없어요
          </p>
          <Link
            href="/home"
            className="mt-2 inline-flex min-h-11 items-center gap-1 text-[13px] text-practice-accent hover:underline"
          >
            연습 시작하기 <ArrowRight size={14} aria-hidden />
          </Link>
        </div>
      </div>
    );

  return (
    <div className="mt-5">
      <p className="text-[14px] text-practice-subtle">
        최근 30일 완료 <strong className="text-practice-ink">{stats.total}회</strong>
      </p>
      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-100 border-collapse text-left text-[14px]">
          <caption className="sr-only">최근 30일 주별 연습 완료 횟수</caption>
          <thead className="border-b border-practice-line text-practice-subtle">
            <tr>
              <th scope="col" className="py-3 font-medium">
                시작 주
              </th>
              <th scope="col" className="py-3 font-medium">
                롤플레잉
              </th>
              <th scope="col" className="py-3 font-medium">
                문장 암기
              </th>
              <th scope="col" className="py-3 font-medium">
                어법 연습
              </th>
            </tr>
          </thead>
          <tbody>
            {stats.weeks.map((week) => (
              <tr key={week.startsOn} className="border-b border-practice-line">
                <th scope="row" className="py-3 font-medium">
                  {week.startsOn}
                </th>
                <td className="py-3">{week.roleplay}</td>
                <td className="py-3">{week.memorization}</td>
                <td className="py-3">{week.grammar}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
    .format(date)
    .replaceAll(" ", "")
    .replace(/\.$/, "");
}
export function MyPageRowsLoading() {
  return (
    <div className={`${emptyClassName} gap-2`} role="status">
      <Spinner
        className="size-4 text-current"
        aria-hidden="true"
        role={undefined}
        aria-label={undefined}
      />
      불러오는 중이에요…
    </div>
  );
}
