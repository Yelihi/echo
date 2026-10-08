import { describe, it, expect } from "@jest/globals";
import { getShellRoute } from "../getShellRoute";

describe("practice workspace routing", () => {
  it.each(["/home", "/my-page", "/sessions", "/role-playing-other"])(
    "%s does not show a practice sidebar",
    (path) => expect(getShellRoute(path).inPractice).toBe(false),
  );
  it.each([
    ["/grammar", "어법 연습", "자료 목록"],
    ["/grammar/note-id", "어법 연습", "어법 노트"],
    ["/grammar/note-id/practice", "어법 연습", "연습 준비"],
    ["/grammar-sessions/id", "어법 연습", "연습 중"],
    ["/grammar-sessions/id/result", "어법 연습", "학습 결과"],
    ["/role-playing", "롤플레잉", "자료 목록"],
    ["/role-playing/new", "롤플레잉", "새 자료"],
    ["/role-playing/id/edit", "롤플레잉", "자료 수정"],
    ["/sentence-memorization/id/ready", "문단 암기", "연습 준비"],
    ["/sentence-memorization/id/session/session-id", "문단 암기", "연습 중"],
    ["/roleplay-sessions/id/result", "롤플레잉", "학습 결과"],
    ["/memorization-sessions/id/result", "문단 암기", "학습 결과"],
  ])("%s identifies the correct workspace and screen", (path, mode, page) => {
    expect(getShellRoute(path)).toMatchObject({ inPractice: true, mode, page });
  });
});
