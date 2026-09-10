/** @jest-environment node */
import { describe, expect, it } from "@jest/globals";
import { assertRecordingResponse } from "../recordingRequestError";
import { classifyRecordingRpcFailure } from "../../services/server/recordingRpcFailure";

describe("녹음 저장 오류 분류", () => {
  it("설치되지 않은 RPC는 충돌이 아니라 서버 준비 오류로 안내한다", async () => {
    const failure = classifyRecordingRpcFailure({ code: "PGRST202", message: "missing function" });
    expect(failure).toEqual({ status: 503, code: "RECORDING_SERVER_NOT_READY" });
    await expect(
      assertRecordingResponse(Response.json({ code: failure.code }, { status: failure.status })),
    ).rejects.toMatchObject({ code: "RECORDING_SERVER_NOT_READY" });
  });
  it("상태 충돌과 알 수 없는 DB 장애를 구분한다", () => {
    expect(
      classifyRecordingRpcFailure({ code: "P0001", message: "Unexpected recording target" }).status,
    ).toBe(409);
    expect(
      classifyRecordingRpcFailure({ code: "XX000", message: "database unavailable" }).status,
    ).toBe(500);
  });
  it("비 JSON 응답도 사용자 안내가 가능한 오류로 변환한다", async () => {
    await expect(
      assertRecordingResponse(new Response("unavailable", { status: 502 })),
    ).rejects.toMatchObject({ code: "RECORDING_SAVE_FAILED" });
  });
});
