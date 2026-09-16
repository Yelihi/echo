import { describe, expect, it } from "@jest/globals";
import { historyHref, parseHistoryQuery } from "../history";
import { mapHistoryPage } from "../historyPage";
import { buildPageHref } from "@/shared/utils/pagination";

describe("학습 기록 URL과 결과 연결", () => {
  it.each(["-1", "1.5", "Infinity", "1e100", "abc"])(
    "잘못된 페이지 %s는 첫 페이지로 처리한다",
    (page) => {
      expect(parseHistoryQuery({ page, status: "unknown", sort: "unknown" })).toEqual({
        page: 1,
        status: "all",
        sort: "newest",
      });
    },
  );
  it("필터 변경은 첫 페이지로, 페이지 이동은 필터와 정렬을 보존한다", () => {
    const query = parseHistoryQuery({ page: "3", status: "failed", sort: "oldest" });
    expect(historyHref({ ...query, page: 1 })).toBe("/sessions?status=failed&sort=oldest");
    expect(buildPageHref("/sessions", "status=failed&sort=oldest&page=3", 4)).toBe(
      "/sessions?status=failed&sort=oldest&page=4",
    );
  });
  it.each(["role-playing", "memorization"] as const)(
    "완료된 %s 세션은 실패해도 결과로 연결한다",
    (kind) => {
      const id = "11111111-1111-4111-8111-111111111111";
      const item = {
        id,
        title: "Test",
        createdAt: "2026-09-10T00:00:00+00:00",
        kind,
        itemCount: 3,
        sourceMaterialId: null,
        targetCount: 3,
        savedCount: 2,
        state: "partial",
        recordingCompleted: true,
      };
      const page = mapHistoryPage({ page: 1, totalPages: 1, totalCount: 1, items: [item] });
      expect(page.sessions[0].href).toBe(
        `/${kind === "role-playing" ? "roleplay" : "memorization"}-sessions/${id}/result`,
      );
      expect(page.sessions[0].disabled).toBe(false);
      expect(
        mapHistoryPage({
          page: 1,
          totalPages: 1,
          totalCount: 1,
          items: [{ ...item, recordingCompleted: false }],
        }).sessions[0].href,
      ).toBe(kind === "role-playing" ? `/role-playing/${id}/session/${id}` : undefined);
    },
  );
});

const incompleteItem = {
  id: "11111111-1111-4111-8111-111111111111",
  sourceMaterialId: "22222222-2222-4222-8222-222222222222",
  title: "카페",
  createdAt: "2026-09-10T00:00:00Z",
  kind: "role-playing",
  itemCount: 10,
  targetCount: 5,
  savedCount: 2,
  state: "pending",
  recordingCompleted: false,
};
function mapIncomplete(overrides: Record<string, unknown> = {}) {
  return mapHistoryPage({
    page: 1,
    totalPages: 1,
    totalCount: 1,
    items: [{ ...incompleteItem, ...overrides }],
  }).sessions[0];
}
it("미완료 세션은 학습자 문장 진행률과 스냅샷 세션 이어하기를 제공한다", () => {
  expect(mapIncomplete()).toMatchObject({
    sessionState: "practicing",
    description: "2/5문장 저장",
    disabled: false,
    href: `/role-playing/${incompleteItem.sourceMaterialId}/session/${incompleteItem.id}`,
  });
  expect(parseHistoryQuery({ status: "practicing" }).status).toBe("practicing");
  expect(mapIncomplete({ savedCount: 5 }).actionLabel).toBe("완료 확인");
  expect(mapIncomplete({ kind: "memorization" })).toMatchObject({
    disabled: true,
    href: undefined,
  });
});
