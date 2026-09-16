import { expect, it, jest } from "@jest/globals";
import { fireEvent, render, screen } from "@testing-library/react";
import { RecordingCompletionPanel } from "../RecordingCompletionPanel";

it("완료 확인 화면에서 저장 건수를 보여주고 명시적 확인 후 완료 처리를 요청한다", () => {
  const onRetry = jest.fn();
  const { rerender } = render(
    <RecordingCompletionPanel title="카페에서 주문하기" savedCount={3} onRetry={onRetry} />,
  );
  expect(screen.getByText("3/3문장 저장 완료")).toBeTruthy();
  expect(screen.getByRole("heading", { name: "저장한 연습을 마무리하세요" })).toBeTruthy();
  expect(screen.queryByRole("link", { name: "분석 결과 확인" })).toBeNull();
  expect(onRetry).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole("button", { name: "연습 완료하고 분석하기" }));
  expect(onRetry).toHaveBeenCalledTimes(1);
  rerender(<RecordingCompletionPanel status="submitting" onRetry={onRetry} />);
  expect(screen.getByRole("button", { name: "완료 처리 중" }).hasAttribute("disabled")).toBe(true);
  rerender(
    <RecordingCompletionPanel status="succeeded" resultHref="/roleplay-sessions/session/result" />,
  );
  expect(screen.getByRole("link", { name: "분석 결과 확인" }).getAttribute("href")).toBe(
    "/roleplay-sessions/session/result",
  );
});
