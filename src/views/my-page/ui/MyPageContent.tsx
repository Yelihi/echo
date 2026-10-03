import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, ChevronRight } from "lucide-react";
import type { GetLatestStudySession } from "@/widgets/latest-sessions/models/studySession";
import styles from "./MyPageContent.module.css";

import type { MyPageMaterialItem } from "@/views/my-page/models/interface";

export function MyPageContent({
  roleplay,
  memorization,
  history,
}: {
  roleplay: ReactNode;
  memorization: ReactNode;
  history: ReactNode;
}) {
  return (
    <div className={styles.home}>
      <header className={styles.greeting}>
        <p className={styles.eyebrow}>MY PRACTICE</p>
        <h1>마이페이지</h1>
        <p>나의 자료와 쌓아온 연습을 한눈에 확인하세요.</p>
        <Link href="/recording-management" className={styles.recordings}>
          녹음 관리 <ArrowRight size={16} aria-hidden />
        </Link>
      </header>
      <div className={styles.materials}>
        <section aria-labelledby="home-roleplay">
          <SectionHeading id="home-roleplay" title="최근 롤플레잉 자료" href="/role-playing" />
          {roleplay}
        </section>
        <section aria-labelledby="home-memorization">
          <SectionHeading
            id="home-memorization"
            title="최근 암기 자료"
            href="/sentence-memorization"
          />
          {memorization}
        </section>
      </div>
      <section className={styles.history} aria-labelledby="home-history">
        <SectionHeading id="home-history" title="최근 학습 기록" href="/sessions" />
        {history}
      </section>
    </div>
  );
}

function SectionHeading({ id, title, href }: { id: string; title: string; href: string }) {
  return (
    <div className={styles.sectionHeading}>
      <h2 id={id}>{title}</h2>
      <Link href={href} aria-label={`${title} 전체 보기`}>
        전체 보기 <ArrowRight size={17} strokeWidth={1.5} aria-hidden />
      </Link>
    </div>
  );
}

export function MyPageMaterialRows({ items }: { items: readonly MyPageMaterialItem[] }) {
  if (!items.length)
    return (
      <p className={styles.empty}>아직 자료가 없어요. 새 자료를 만들어 연습을 시작해보세요.</p>
    );
  return (
    <ul>
      {items.map((item) => (
        <li key={item.id}>
          <Link href={item.href} className={styles.materialRow}>
            <div className={styles.materialText}>
              <p>{item.title}</p>
              <span>{item.description}</span>
            </div>
            <time dateTime={item.date.toISOString()}>{formatDate(item.date)}</time>
            <ChevronRight size={17} strokeWidth={1.5} aria-hidden />
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
export function MyPageHistoryRows({ sessions }: { sessions: readonly GetLatestStudySession[] }) {
  if (!sessions.length)
    return <p className={styles.empty}>아직 학습 기록이 없어요. 첫 연습을 시작해보세요.</p>;
  return (
    <ul>
      {sessions.map((session) => {
        const content = (
          <>
            <time dateTime={session.sessionDate.toISOString()}>
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
            <p className={styles.historyTitle}>{session.title}</p>
            <span className={styles.kind}>
              {session.sessionType === "role-playing" ? "롤플레잉" : "문단 암기"}
            </span>
            <span className={styles.status} data-state={session.sessionState}>
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
                className={styles.historyRow}
                aria-label={`${session.title} · ${states[session.sessionState]} · ${session.actionLabel || "결과 보기"}`}
              >
                {content}
              </Link>
            ) : (
              <div className={styles.historyRow} aria-disabled={session.disabled}>
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
    <div className={styles.empty} role="status">
      불러오는 중이에요…
    </div>
  );
}
