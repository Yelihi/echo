/** 목록 검색 조건을 유지하되 외부 주소나 임의 라우트로 이동하지 않는다. */
export function grammarReturnTo(value: string | string[] | undefined): string {
  if (typeof value !== "string") return "/grammar";
  return value === "/grammar" || value.startsWith("/grammar?") ? value : "/grammar";
}
