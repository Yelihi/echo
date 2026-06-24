import { describe, expect, it } from "@jest/globals";

import { mapRecordingAudioFields } from "@/entities/value-object";

describe("mapRecordingAudioFields", () => {
  it("maps audio storage fields into a recording audio value object", () => {
    const audio = mapRecordingAudioFields(
      {
        bucket_id: "recordings",
        object_path: "users/user-a/recording.wav",
        mime_type: "audio/wav",
        size_bytes: 1024,
        duration_ms: 3000,
      },
      "test recording",
    );

    expect(audio).toEqual({
      bucketId: "recordings",
      objectPath: "users/user-a/recording.wav",
      mimeType: "audio/wav",
      sizeBytes: 1024,
      durationMs: 3000,
    });
  });

  it("rejects non-audio mime types", () => {
    expect(() =>
      mapRecordingAudioFields(
        {
          bucket_id: "recordings",
          object_path: "users/user-a/recording.png",
          mime_type: "image/png",
          size_bytes: 1024,
          duration_ms: null,
        },
        "test recording",
      ),
    ).toThrow("Invalid test recording mime type: image/png");
  });
});
