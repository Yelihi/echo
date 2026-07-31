const TIME_ZONE = "Asia/Seoul";

const timeFormatter = new Intl.DateTimeFormat("ko-KR", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: TIME_ZONE,
});

const relativeFormatter = new Intl.RelativeTimeFormat("ko-KR", {
  numeric: "auto",
});

const dayFormatter = new Intl.DateTimeFormat("en-CA", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  timeZone: TIME_ZONE,
});

const toSeoulDayTime = (date: Date) => {
  // formatToParts 결과를 year/month/day로 바로 꺼내기 위해 객체로 바꿉니다.
  const parts = Object.fromEntries(
    dayFormatter.formatToParts(date).map((part) => [part.type, part.value]),
  );

  return Date.UTC(Number(parts.year), Number(parts.month) - 1, Number(parts.day));
};

export const convertFormatDate = (date: Date, now = new Date()) => {
  const today = toSeoulDayTime(now);
  const targetDay = toSeoulDayTime(date);

  const diffDays = Math.floor((targetDay - today) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return `오늘 ${timeFormatter.format(date)}`;
  }

  if (diffDays === -1) {
    return `어제 ${timeFormatter.format(date)}`;
  }

  return relativeFormatter.format(diffDays, "day");
};
