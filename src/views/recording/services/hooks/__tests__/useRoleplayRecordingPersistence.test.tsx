import { afterEach, describe, expect, it, jest } from "@jest/globals";
import { act, renderHook } from "@testing-library/react";
import { useRoleplayRecordingPersistence } from "../useRoleplayRecordingPersistence";

const originalFetch = globalThis.fetch;
afterEach(() => {
  globalThis.fetch = originalFetch;
});

describe("세션 완료 요청", () => {
  it("중복 완료 이벤트는 요청 하나로 제한하고 성공 후 결과 링크 상태를 연다", async () => {
    let resolve!: (response: Response) => void;
    const request = jest.fn<typeof fetch>(
      () =>
        new Promise((done) => {
          resolve = done;
        }),
    );
    globalThis.fetch = request;
    const { result } = renderHook(() => useRoleplayRecordingPersistence("session"));
    let completion!: Promise<void>;
    act(() => {
      completion = result.current.completeRecordingSession();
    });
    expect(result.current.completionStatus).toBe("submitting");
    await act(async () => {
      await result.current.completeRecordingSession();
    });
    expect(request).toHaveBeenCalledTimes(1);
    const body = request.mock.calls[0][1]?.body;
    expect(body).toBeInstanceOf(FormData);
    if (!(body instanceof FormData)) throw new Error("Expected multipart request");
    expect(body.get("action")).toBe("finish");
    await act(async () => {
      resolve({ ok: true } as Response);
      await completion;
    });
    expect(result.current.completionStatus).toBe("succeeded");
  });

  it("응답 유실 시 실패를 표시하고 사용자의 완료 재시도를 허용한다", async () => {
    const request = jest
      .fn<typeof fetch>()
      .mockRejectedValueOnce(new Error("Network failure"))
      .mockResolvedValueOnce({ ok: true } as Response);
    globalThis.fetch = request;
    const { result } = renderHook(() => useRoleplayRecordingPersistence("session"));
    await act(async () => {
      await expect(result.current.completeRecordingSession()).rejects.toThrow("Network failure");
    });
    expect(result.current.completionStatus).toBe("failed");
    await act(async () => {
      await result.current.completeRecordingSession();
    });
    expect(result.current.completionStatus).toBe("succeeded");
    expect(request).toHaveBeenCalledTimes(2);
  });
});
