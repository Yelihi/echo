import { describe, expect, it, jest } from "@jest/globals";

import { STTProviderError, isAcceptedSTTAudioExtension } from "@/shared/lib/stt";
import { OpenAISTTProvider } from "@/shared/lib/stt/server";

jest.mock("server-only", () => ({}));

describe("isAcceptedSTTAudioExtension", () => {
  it("OpenAI 전사 업로드가 지원하는 오디오 확장자이면 true를 반환한다", () => {
    expect(isAcceptedSTTAudioExtension("webm")).toBe(true);
    expect(isAcceptedSTTAudioExtension("mp4")).toBe(true);
    expect(isAcceptedSTTAudioExtension("m4a")).toBe(true);
    expect(isAcceptedSTTAudioExtension("wav")).toBe(true);
  });

  it("aac가 STT provider 정상 흐름에 들어가기 전에 false를 반환한다", () => {
    expect(isAcceptedSTTAudioExtension("aac")).toBe(false);
  });
});

describe("OpenAISTTProvider", () => {
  it("OpenAI 전사 응답을 provider 계약의 transcript로 정규화한다", async () => {
    const create = jest.fn(async () => ({ text: "  Hello there.  " }));
    const provider = new OpenAISTTProvider({
      client: createOpenAIClientStub(create),
      model: "gpt-4o-mini-transcribe",
    });

    const result = await provider.transcribe({
      audio: new Uint8Array([1, 2, 3]),
      filename: "recording.webm",
      mimeType: "audio/webm",
    });

    expect(result).toEqual({
      provider: "openai",
      model: "gpt-4o-mini-transcribe",
      text: "Hello there.",
    });
    expect(create).toHaveBeenCalledTimes(1);
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        model: "gpt-4o-mini-transcribe",
        response_format: "json",
      }),
    );
  });

  it("지원하지 않는 포맷이면 OpenAI 호출 전에 실패한다", async () => {
    const create = jest.fn(async () => ({ text: "unused" }));
    const provider = new OpenAISTTProvider({
      client: createOpenAIClientStub(create),
      model: "gpt-4o-mini-transcribe",
    });

    await expect(
      provider.transcribe({
        audio: new Uint8Array([1, 2, 3]),
        filename: "recording.aac",
        mimeType: "audio/aac",
      }),
    ).rejects.toMatchObject({
      code: "unsupported-audio-format",
      retryable: false,
    });
    expect(create).not.toHaveBeenCalled();
  });

  it("OpenAI rate limit 오류를 재시도 가능한 provider 오류로 변환한다", async () => {
    const create = jest.fn(async () => {
      throw { status: 429, message: "rate limited" };
    });
    const provider = new OpenAISTTProvider({
      client: createOpenAIClientStub(create),
      model: "gpt-4o-mini-transcribe",
    });

    await expect(
      provider.transcribe({
        audio: new Uint8Array([1, 2, 3]),
        filename: "recording.webm",
        mimeType: "audio/webm",
      }),
    ).rejects.toMatchObject({
      code: "provider-rate-limited",
      retryable: true,
    });
  });

  it("빈 transcript를 재시도 불가능한 provider 오류로 변환한다", async () => {
    const create = jest.fn(async () => ({ text: "   " }));
    const provider = new OpenAISTTProvider({
      client: createOpenAIClientStub(create),
      model: "gpt-4o-mini-transcribe",
    });

    try {
      await provider.transcribe({
        audio: new Uint8Array([1, 2, 3]),
        filename: "recording.webm",
        mimeType: "audio/webm",
      });
      throw new Error("전사가 실패해야 합니다.");
    } catch (error) {
      expect(error).toBeInstanceOf(STTProviderError);
      expect(error).toMatchObject({
        code: "empty-transcript",
        retryable: false,
      });
    }
  });
});

type TranscriptionCreate = jest.Mock<(params: unknown) => Promise<{ text: string }>>;

function createOpenAIClientStub(create: TranscriptionCreate) {
  return {
    audio: {
      transcriptions: {
        create,
      },
    },
  };
}
