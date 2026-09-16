import { render, screen } from "@testing-library/react";
import { expect, it } from "@jest/globals";
import { SessionSimplified } from "../SessionSimplified";

it("미완료 연습의 진행률과 이어하기 링크를 표시한다", () => {
  render(
    <SessionSimplified
      title="카페"
      sessionDate={new Date("2026-09-12T00:00:00Z")}
      description="2/5문장 저장"
      sessionType="role-playing"
      sessionState="practicing"
      href="/role-playing/material/session/session"
    />,
  );
  expect(screen.getByText("연습 중")).toBeInTheDocument();
  expect(screen.getByText(/2\/5문장 저장/)).toBeInTheDocument();
  expect(screen.getByRole("link", { name: /이어서 연습/ })).toHaveAttribute(
    "href",
    "/role-playing/material/session/session",
  );
});
