// 복귀 주소는 URL 입력이므로, 외부 이동을 막으면서 검색 조건을 보존할 수 있는 목록 경로만 허용한다.
export function grammarReturnTo(value: string | string[] | undefined): string {
  if (typeof value !== "string") return "/grammar";

  return value === "/grammar" || value.startsWith("/grammar?") ? value : "/grammar";
}
