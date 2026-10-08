/** Route segments, not string prefixes, determine the practice workspace. */
export function getShellRoute(pathname: string) {
  const [root, ...segments] = pathname.split("/").filter(Boolean);
  const isRoleplay = root === "role-playing" || root === "roleplay-sessions";
  const isMemorization = root === "sentence-memorization" || root === "memorization-sessions";
  const isGrammar = root === "grammar" || root === "grammar-sessions";
  const last = segments.at(-1);
  const page =
    last === "new"
      ? "새 자료"
      : last === "edit"
        ? "자료 수정"
        : last === "result"
          ? "학습 결과"
          : last === "ready" || last === "practice"
            ? "연습 준비"
            : segments.includes("session") || root === "grammar-sessions"
              ? "연습 중"
              : isGrammar && segments.length
                ? "어법 노트"
                : "자료 목록";
  return {
    inPractice: isRoleplay || isMemorization || isGrammar,
    base: isGrammar ? "/grammar" : isRoleplay ? "/role-playing" : "/sentence-memorization",
    mode: isGrammar ? "어법 연습" : isRoleplay ? "롤플레잉" : "문단 암기",
    page,
  };
}
