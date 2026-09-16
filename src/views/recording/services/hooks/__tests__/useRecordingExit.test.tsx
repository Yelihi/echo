import { beforeEach, expect, it, jest } from "@jest/globals";
import { act, renderHook, waitFor } from "@testing-library/react";
import { createElement, type ReactNode } from "react";
import { AppRouterContext } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { useRecordingExit } from "../useRecordingExit";

const push = jest.fn();
const refresh = jest.fn();
const router = {
  push,
  refresh,
  replace: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  prefetch: jest.fn(),
};
const sessionPath = "/role-playing/material/session/session";
function wrapper({ children }: { children: ReactNode }) {
  return createElement(AppRouterContext.Provider, { value: router }, children);
}
beforeEach(() => {
  jest.clearAllMocks();
  window.history.replaceState({ __NA: true }, "", "/sessions");
  window.history.pushState({ __NA: true }, "", sessionPath);
});

it("X는 확인 후 이동하며 저장 전 녹음이 없으면 새로고침을 막지 않는다", () => {
  const { result } = renderHook(() => useRecordingExit(false, false), { wrapper });
  act(() => result.current.requestExit("/sessions", true));
  expect(result.current.confirmOpen).toBe(true);
  expect(push).not.toHaveBeenCalled();
  const event = new Event("beforeunload", { cancelable: true });
  window.dispatchEvent(event);
  expect(event.defaultPrevented).toBe(false);
  act(() => result.current.confirmExit());
  expect(push).toHaveBeenCalledWith("/sessions");
});

it("녹음 중 새로고침·닫기를 경고하며 브라우저 뒤로가기를 취소하거나 승인한다", async () => {
  const { result } = renderHook(() => useRecordingExit(true, false), { wrapper });
  expect(window.history.state.__NA).toBe(true);
  const event = new Event("beforeunload", { cancelable: true });
  window.dispatchEvent(event);
  expect(event.defaultPrevented).toBe(true);
  act(() => window.history.back());
  await waitFor(() => expect(result.current.confirmOpen).toBe(true));
  expect(window.location.pathname).toBe(sessionPath);
  act(() => result.current.setConfirmOpen(false));
  expect(window.location.pathname).toBe(sessionPath);
  act(() => window.history.back());
  await waitFor(() => expect(result.current.confirmOpen).toBe(true));
  act(() => result.current.confirmExit());
  await waitFor(() => expect(window.location.pathname).toBe("/sessions"));
});

it("저장 중 뒤로가기는 막고 저장 후 뒤로가기는 이전 화면으로 이동한다", async () => {
  const { result, rerender } = renderHook(({ saving }) => useRecordingExit(saving, saving), {
    initialProps: { saving: true },
    wrapper,
  });
  act(() => result.current.requestExit("/sessions", true));
  expect(push).not.toHaveBeenCalled();
  const pushed = jest.spyOn(window.history, "pushState");
  act(() => window.history.back());
  await waitFor(() => expect(pushed).toHaveBeenCalled());
  pushed.mockRestore();
  expect(result.current.blocked).toBe(true);
  expect(result.current.confirmOpen).toBe(false);
  expect(window.location.pathname).toBe(sessionPath);
  rerender({ saving: false });
  act(() => window.history.back());
  await waitFor(() => expect(window.location.pathname).toBe("/sessions"));
});

it("강제 새로고침 뒤에도 뒤로가기는 같은 세션에 멈추지 않고 이전 화면으로 이동한다", async () => {
  window.history.pushState(
    { __NA: true, echoRecordingExit: window.location.href },
    "",
    sessionPath,
  );
  renderHook(() => useRecordingExit(false, false), { wrapper });
  act(() => window.history.back());
  await waitFor(() => expect(window.location.pathname).toBe("/sessions"));
});
