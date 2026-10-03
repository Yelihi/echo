/** @jest-environment node */
import { expect, it, jest } from "@jest/globals";
import type { RoleplayRecordingContext } from "../../../models/roleplayRecording";

jest.mock("server-only", () => ({}));

it("크기 초과 파일은 DB나 스토리지 호출 전에 413으로 거절한다", async () => {
  const { saveLearnerRecording } = await import("../saveLearnerRecording");
  const form = new FormData();
  form.set("recordingId", "11111111-1111-4111-8111-111111111111");
  form.set("lineId", "22222222-2222-4222-8222-222222222222");
  form.set("durationMs", "1000");
  form.set("file", new Blob([new Uint8Array(4_000_001)], { type: "audio/webm" }), "audio.webm");
  // No clients: reaching storage or the database makes this test fail.
  const response = await saveLearnerRecording(form, {} as RoleplayRecordingContext);
  expect(response.status).toBe(413);
  expect(await response.json()).toEqual({ code: "RECORDING_TOO_LARGE" });
});
