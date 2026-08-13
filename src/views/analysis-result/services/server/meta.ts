const PRODUCT_TIME_ZONE = "Asia/Seoul";

export function createMeta(date: Date, count: number): string {
  return `${new Intl.DateTimeFormat("ko-KR", {
    timeZone: PRODUCT_TIME_ZONE,
    hour: "numeric",
    minute: "2-digit",
  }).format(date)} · 문장 ${count}개`;
}
