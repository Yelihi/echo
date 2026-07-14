import { describe, expect, it, jest } from "@jest/globals";

import { RecordingStorageService } from "@/shared/lib/recording-storage/server";

describe("RecordingStorageService", () => {
  it("uploads to the private recordings bucket with the provided content type", async () => {
    const upload = jest.fn(async () => ({ data: { path: "object.webm" }, error: null }));
    const service = new RecordingStorageService(createClient({ upload }));
    const file = new Blob(["audio"], { type: "audio/webm" });

    await service.upload({
      objectPath: "user/session/recording.webm",
      file,
      contentType: "audio/webm",
    });

    expect(upload).toHaveBeenCalledWith("user/session/recording.webm", file, {
      contentType: "audio/webm",
      upsert: false,
    });
  });

  it("creates a 600 second signed playback URL", async () => {
    const createSignedUrl = jest.fn(async () => ({
      data: { signedUrl: "https://signed.example/audio" },
      error: null,
    }));
    const service = new RecordingStorageService(createClient({ createSignedUrl }));

    const result = await service.createSignedPlaybackUrl("user/session/recording.webm");

    expect(result.signedUrl).toBe("https://signed.example/audio");
    expect(result.expiresInSeconds).toBe(600);
    expect(createSignedUrl).toHaveBeenCalledWith("user/session/recording.webm", 600);
  });

  it("removes an object from the recordings bucket", async () => {
    const remove = jest.fn(async () => ({ data: [], error: null }));
    const service = new RecordingStorageService(createClient({ remove }));

    await service.remove("user/session/recording.webm");

    expect(remove).toHaveBeenCalledWith(["user/session/recording.webm"]);
  });
});

function createClient(methods: Record<string, unknown>) {
  const bucket = {
    upload: jest.fn(),
    createSignedUrl: jest.fn(),
    remove: jest.fn(),
    ...methods,
  };

  return {
    storage: {
      from: jest.fn(() => bucket),
    },
  } as never;
}
