import "server-only";

import { toFile } from "openai";

import { getOpenAIServerClient, getOpenAISTTModel } from "@/shared/lib/openai/server";
import { STTProviderError, mapToSTTProviderError } from "@/shared/lib/stt/errors";
import type { STTProvider, STTProviderInput, STTTranscript } from "@/shared/lib/stt/types";
import { getFilenameExtension, isAcceptedSTTAudioExtension } from "@/shared/lib/stt/validation";

type OpenAITranscriptionClient = {
  readonly audio: {
    readonly transcriptions: {
      create(params: {
        readonly file: File;
        readonly model: string;
        readonly response_format: "json";
      }): Promise<{ readonly text?: string }>;
    };
  };
};

export interface OpenAISTTProviderOptions {
  readonly client?: OpenAITranscriptionClient;
  readonly model?: string;
}

export class OpenAISTTProvider implements STTProvider {
  private readonly client: OpenAITranscriptionClient;
  private readonly model: string;

  constructor(options: OpenAISTTProviderOptions = {}) {
    this.client = options.client ?? getOpenAIServerClient();
    this.model = options.model ?? getOpenAISTTModel();
  }

  async transcribe(input: STTProviderInput): Promise<STTTranscript> {
    assertAcceptedAudio(input.filename);

    try {
      const response = await this.client.audio.transcriptions.create({
        file: await toFile(input.audio, input.filename, { type: input.mimeType }),
        model: this.model,
        response_format: "json",
      });
      const text = response.text?.trim() ?? "";

      if (!text) {
        throw new STTProviderError(
          "empty-transcript",
          "STT provider returned an empty transcript.",
          {
            retryable: false,
          },
        );
      }

      return {
        provider: "openai",
        model: this.model,
        text,
      };
    } catch (error) {
      throw mapToSTTProviderError(error);
    }
  }
}

function assertAcceptedAudio(filename: string): void {
  const extension = getFilenameExtension(filename);

  if (!isAcceptedSTTAudioExtension(extension)) {
    throw new STTProviderError(
      "unsupported-audio-format",
      `Unsupported STT audio format: ${extension || "unknown"}.`,
      { retryable: false },
    );
  }
}
