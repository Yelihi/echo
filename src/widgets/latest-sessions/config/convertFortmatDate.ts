const timeFormatter = new Intl.DateTimeFormat("ko-KR", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

const relativeFormatter = new Intl.RelativeTimeFormat("ko-KR", {
  numeric: "auto",
});

export const convertFormatDate = (date: Date) => {
  const now = new Date();

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const targetDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  const diffDays = Math.floor((targetDay.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return `오늘 ${timeFormatter.format(date)}`;
  }

  if (diffDays === 1) {
    return `어제 ${timeFormatter.format(date)}`;
  }

  return relativeFormatter.format(diffDays, "day");
};
