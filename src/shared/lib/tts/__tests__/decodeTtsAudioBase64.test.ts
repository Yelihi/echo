import { describe, expect, it } from "@jest/globals";

import { decodeTtsAudioBase64 } from "@/shared/lib/tts/decodeTtsAudioBase64";

describe("decodeTtsAudioBase64", () => {
  it("should decode base64 audio into a blob of the given mime type", () => {
    const bytes = new Uint8Array([1, 2, 3, 255]);
    const blob = decodeTtsAudioBase64(Buffer.from(bytes).toString("base64"), "audio/mpeg");

    expect(blob.type).toBe("audio/mpeg");
    expect(blob.size).toBe(bytes.byteLength);
  });
});
