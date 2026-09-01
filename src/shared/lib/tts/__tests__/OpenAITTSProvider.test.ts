import { describe, expect, it, jest } from "@jest/globals";

import {
  TtsEmptyInputError,
  TtsInvalidSpeedError,
  TtsProviderRateLimitedError,
} from "@/shared/lib/tts";
import { OpenAITTSProvider } from "@/shared/lib/tts/server";

jest.mock("server-only", () => ({}));

describe("OpenAITTSProvider", () => {
  it("should return mp3 audio from an OpenAI speech response", async () => {
    const audio = new Uint8Array([1, 2, 3, 4]);
    const create = jest.fn(async () => ({
      arrayBuffer: async () =>
        audio.buffer.slice(audio.byteOffset, audio.byteOffset + audio.byteLength),
    }));
    const provider = new OpenAITTSProvider({
      client: createSpeechClientStub(create),
      model: "tts-1",
    });

    const result = await provider.speak({
      text: "  Hello there.  ",
      voice: "nova",
      speed: 0.9,
    });

    expect(result).toEqual({
      provider: "openai",
      model: "tts-1",
      mimeType: "audio/mpeg",
      audio,
    });
    expect(create).toHaveBeenCalledWith({
      model: "tts-1",
      voice: "nova",
      input: "Hello there.",
      speed: 0.9,
      response_format: "mp3",
    });
  });

  it("should reject empty text before calling OpenAI", async () => {
    const create = jest.fn(async () => ({
      arrayBuffer: async () => new Uint8Array([1]).buffer,
    }));
    const provider = new OpenAITTSProvider({
      client: createSpeechClientStub(create),
    });

    await expect(provider.speak({ text: "   ", voice: "nova", speed: 1 })).rejects.toBeInstanceOf(
      TtsEmptyInputError,
    );
    expect(create).not.toHaveBeenCalled();
  });

  it("should reject a speed outside the OpenAI range before calling OpenAI", async () => {
    const create = jest.fn(async () => ({
      arrayBuffer: async () => new Uint8Array([1]).buffer,
    }));
    const provider = new OpenAITTSProvider({
      client: createSpeechClientStub(create),
    });

    await expect(
      provider.speak({ text: "Hello", voice: "nova", speed: 4.5 }),
    ).rejects.toBeInstanceOf(TtsInvalidSpeedError);
    expect(create).not.toHaveBeenCalled();
  });

  it("should map an OpenAI rate limit error to a retryable provider error", async () => {
    const create = jest.fn(async () => {
      throw { status: 429, message: "rate limited" };
    });
    const provider = new OpenAITTSProvider({
      client: createSpeechClientStub(create),
    });

    await expect(provider.speak({ text: "Hello", voice: "nova", speed: 1 })).rejects.toBeInstanceOf(
      TtsProviderRateLimitedError,
    );
  });
});

type SpeechCreate = jest.Mock<() => Promise<{ arrayBuffer(): Promise<ArrayBuffer> }>>;

function createSpeechClientStub(create: SpeechCreate) {
  return {
    audio: {
      speech: {
        create,
      },
    },
  };
}
