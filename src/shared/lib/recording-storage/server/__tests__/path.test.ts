import { describe, expect, it } from "@jest/globals";

import {
  buildRecordingObjectPath,
  getRecordingExtensionFromMimeType,
  UnsupportedRecordingMimeTypeError,
} from "@/shared/lib/recording-storage/server";

describe("buildRecordingObjectPath", () => {
  it("builds a user and session scoped recording object path", () => {
    expect(
      buildRecordingObjectPath({
        userId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
        sessionId: "22222222-2222-4222-8222-222222222222",
        recordingId: "11111111-1111-4111-8111-111111111111",
        mimeType: "audio/webm",
      }),
    ).toBe(
      "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa/22222222-2222-4222-8222-222222222222/11111111-1111-4111-8111-111111111111.webm",
    );
  });

  it("rejects unsupported recording mime types before a path is created", () => {
    expect(() => getRecordingExtensionFromMimeType("application/json")).toThrow(
      "Unsupported recording MIME type: application/json",
    );
  });

  it("throws a stable storage error when building a path for an unsupported recording mime type", () => {
    expect(() =>
      buildRecordingObjectPath({
        userId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
        sessionId: "22222222-2222-4222-8222-222222222222",
        recordingId: "11111111-1111-4111-8111-111111111111",
        mimeType: "application/json",
      }),
    ).toThrow(
      expect.objectContaining({
        code: "RECORDING-001",
        message: "Unsupported recording MIME type: application/json",
        name: "UnsupportedRecordingMimeTypeError",
      }),
    );

    expect(() =>
      buildRecordingObjectPath({
        userId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
        sessionId: "22222222-2222-4222-8222-222222222222",
        recordingId: "11111111-1111-4111-8111-111111111111",
        mimeType: "application/json",
      }),
    ).toThrow(UnsupportedRecordingMimeTypeError);
  });
});
