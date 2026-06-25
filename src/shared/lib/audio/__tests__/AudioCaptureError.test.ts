import { describe, expect, it } from "@jest/globals";

import { AudioCaptureError, mapAudioCaptureStartError } from "@/shared/lib/audio";

describe("AudioCaptureError", () => {
  it("keeps code, message, and cause for later custom error integration", () => {
    const cause = new Error("browser failure");
    const error = new AudioCaptureError("recorder-start-failed", "Recording failed to start.", {
      cause,
    });

    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe("AudioCaptureError");
    expect(error.code).toBe("recorder-start-failed");
    expect(error.message).toBe("Recording failed to start.");
    expect(error.cause).toBe(cause);
  });

  it("maps getUserMedia permission denial to permission-denied", () => {
    const error = mapAudioCaptureStartError(new DOMException("denied", "NotAllowedError"));

    expect(error).toMatchObject({
      code: "permission-denied",
      message: "Microphone permission was denied.",
    });
  });

  it("maps missing input device to device-not-found", () => {
    const error = mapAudioCaptureStartError(new DOMException("missing", "NotFoundError"));

    expect(error).toMatchObject({
      code: "device-not-found",
      message: "No microphone input device was found.",
    });
  });
});
