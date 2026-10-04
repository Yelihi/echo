/** Route segments, not string prefixes, determine the practice workspace. */
export function getShellRoute(pathname: string) {
  const [root, ...segments] = pathname.split("/").filter(Boolean);
  const isRoleplay = root === "role-playing" || root === "roleplay-sessions";
  const isMemorization = root === "sentence-memorization" || root === "memorization-sessions";
  const last = segments.at(-1);
  const page =
    last === "new"
      ? "새 자료"
      : last === "edit"
        ? "자료 수정"
        : last === "result"
          ? "학습 결과"
          : last === "ready"
            ? "연습 준비"
            : segments.includes("session")
              ? "연습 중"
              : "자료 목록";
  return {
    inPractice: isRoleplay || isMemorization,
    base: isRoleplay ? "/role-playing" : "/sentence-memorization",
    mode: isRoleplay ? "롤플레잉" : "문단 암기",
    page,
  };
}
