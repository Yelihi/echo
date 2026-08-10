import { describe, expect, it } from "@jest/globals";

import { getRecordingSessionHint } from "@/views/recording/ui/recordingSessionMessage";

describe("getRecordingSessionHint", () => {
  it("maps capture error codes to Korean copy", () => {
    expect(
      getRecordingSessionHint(
        "failed",
        { status: "failed", errorCode: "permission-denied" },
        false,
      ),
    ).toBe("마이크 권한을 허용한 뒤 다시 시도해주세요.");
  });

  it("shows save failure without replacing the recorded audio state", () => {
    expect(
      getRecordingSessionHint(
        "recorded",
        {
          status: "recorded",
          audio: {
            blob: new Blob(["audio"]),
            durationMs: 1200,
            extension: "webm",
            mimeType: "audio/webm",
          },
        },
        true,
      ),
    ).toBe("저장하지 못했습니다. 다시 시도해주세요.");
  });
});
