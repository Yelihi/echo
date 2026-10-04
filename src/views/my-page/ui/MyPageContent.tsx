import Link from "next/link";
import { ArrowRight, ChevronRight } from "lucide-react";

import type {
  MyPageContentProps,
  MyPageSectionHeadingProps,
  MyPageMaterialRowsProps,
  MyPageHistoryRowsProps,
} from "@/views/my-page/models/interface";

const emptyClassName =
  "flex min-h-41 items-center text-[14px] leading-[1.7] text-practice-subtle group-data-history:min-h-30";
const historyRowClassName =
  "group/history grid min-h-15 grid-cols-[16.5%_20%_1fr_178px_20px] items-center gap-0 border-b border-practice-line text-[16px] [&>svg]:text-practice-subtle max-md:grid-cols-[1fr_auto_18px] max-md:gap-x-2.5 max-md:gap-y-2 max-md:py-4 max-md:[&>svg]:col-start-3 max-md:[&>svg]:row-start-2";

export function MyPageContent({ roleplay, memorization, history }: MyPageContentProps) {
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
      <div className="grid grid-cols-2 border-b border-practice-line pt-7.75 pb-8 max-md:grid-cols-1 max-md:gap-6">
        <section aria-labelledby="my-page-roleplay" className="min-w-0 pr-10.5 max-md:p-0">
          <SectionHeading id="my-page-roleplay" title="최근 롤플레잉 자료" href="/role-playing" />
          {roleplay}
        </section>
        <section
          aria-labelledby="my-page-memorization"
          className="min-w-0 border-l border-practice-line pl-10.5 max-md:border-t max-md:border-l-0 max-md:pt-6 max-md:pl-0"
        >
          <SectionHeading
            id="my-page-memorization"
            title="최근 암기 자료"
            href="/sentence-memorization"
          />
          {memorization}
        </section>
      </div>
      <section data-history className="group pt-6" aria-labelledby="my-page-history">
        <SectionHeading id="my-page-history" title="최근 학습 기록" href="/sessions" />
        {history}
      </section>
    </div>
  );
}

function SectionHeading({ id, title, href }: MyPageSectionHeadingProps) {
  return (
    <div className="mb-1.75 flex min-h-8.5 items-center justify-between gap-4 group-data-history:mb-0.75">
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

const states = {
  completed: "분석 완료",
  practicing: "진행 중",
  failed: "분석 실패",
  partial: "일부 실패",
  inProgress: "분석 중",
  pending: "분석 전",
};
export function MyPageHistoryRows({ sessions }: MyPageHistoryRowsProps) {
  if (!sessions.length)
    return <p className={emptyClassName}>아직 학습 기록이 없어요. 첫 연습을 시작해보세요.</p>;
  return (
    <ul>
      {sessions.map((session) => {
        const content = (
          <>
            <time
              className="text-practice-subtle max-md:col-start-1 max-md:text-[12px]"
              dateTime={session.sessionDate.toISOString()}
            >
              {new Intl.DateTimeFormat("ko-KR", {
                timeZone: "Asia/Seoul",
                month: "2-digit",
                day: "2-digit",
              })
                .format(session.sessionDate)
                .replaceAll(" ", "")
                .replace(/\.$/, "")}{" "}
              (
              {new Intl.DateTimeFormat("ko-KR", {
                timeZone: "Asia/Seoul",
                weekday: "short",
              }).format(session.sessionDate)}
              )
            </time>
            <p className="pr-4 [overflow-wrap:anywhere] group-hover/history:underline group-hover/history:underline-offset-4 max-md:col-start-1 max-md:row-start-2 max-md:p-0 max-md:text-[16px]">
              {session.title}
            </p>
            <span className="text-practice-subtle max-md:col-start-1 max-md:row-start-3 max-md:text-[13px]">
              {session.sessionType === "role-playing" ? "롤플레잉" : "문단 암기"}
            </span>
            <span
              className="justify-self-start rounded-md bg-practice-neutral-surface px-3 py-1.5 text-[15px] text-practice-secondary data-[state=completed]:bg-practice-success-surface data-[state=completed]:text-practice-success data-[state=practicing]:bg-practice-pending-surface data-[state=practicing]:text-practice-pending data-[state=failed]:bg-practice-error-surface data-[state=failed]:text-practice-error data-[state=partial]:bg-practice-error-surface data-[state=partial]:text-practice-error max-md:col-start-2 max-md:row-start-2 max-md:text-[12px]"
              data-state={session.sessionState}
            >
              {states[session.sessionState]}
            </span>
            {session.href && !session.disabled && <ChevronRight aria-hidden size={18} />}
          </>
        );
        return (
          <li key={session.id}>
            {session.href && !session.disabled ? (
              <Link
                href={session.href}
                className={historyRowClassName}
                aria-label={`${session.title} · ${states[session.sessionState]} · ${session.actionLabel || "결과 보기"}`}
              >
                {content}
              </Link>
            ) : (
              <div className={historyRowClassName} aria-disabled={session.disabled}>
                {content}
              </div>
            )}
          </li>
        );
      })}
    </ul>
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
    <div className={emptyClassName} role="status">
      불러오는 중이에요…
    </div>
  );
}
