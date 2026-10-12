import type { PracticeCompletion, PracticeStats } from "../../models/interface";

const dayMs = 24 * 60 * 60 * 1000;
const koreanDateFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: "Asia/Seoul",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export function koreanDay(date: Date) {
  const parts = Object.fromEntries(
    koreanDateFormatter.formatToParts(date).map(({ type, value }) => [type, value]),
  );
  return `${parts.year}-${parts.month}-${parts.day}`;
}

function weekStart(day: string) {
  const date = new Date(`${day}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() - ((date.getUTCDay() + 6) % 7));
  return date.toISOString().slice(0, 10);
}

export function summarizePracticeStats(
  completions: PracticeCompletion[],
  now: Date,
): PracticeStats {
  const todayKst = koreanDay(now);
  const start = koreanDay(new Date(now.getTime() - 29 * dayMs));
  const weeks = new Map<string, PracticeStats["weeks"][number]>();

  for (
    let time = Date.parse(`${start}T00:00:00Z`);
    time <= Date.parse(`${todayKst}T00:00:00Z`);
    time += dayMs
  ) {
    const startsOn = weekStart(new Date(time).toISOString().slice(0, 10));
    if (!weeks.has(startsOn))
      weeks.set(startsOn, { startsOn, roleplay: 0, memorization: 0, grammar: 0 });
  }

  let total = 0;
  for (const completion of completions) {
    const timestamp = Date.parse(completion.completedAt);
    if (!Number.isFinite(timestamp) || timestamp > now.getTime()) continue;
    const day = koreanDay(new Date(timestamp));
    if (day < start || day > todayKst) continue;
    const week = weeks.get(weekStart(day));
    if (!week) continue;
    week[completion.kind] += 1;
    total += 1;
  }
  return { total, weeks: [...weeks.values()] };
}
