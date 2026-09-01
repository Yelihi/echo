import "server-only";

import { getOpenAIServerClient, getOpenAITTSModel } from "@/shared/lib/openai/server";
import {
  TtsEmptyAudioError,
  TtsEmptyInputError,
  TtsInvalidSpeedError,
  TtsInvalidVoiceError,
  mapToTtsProviderError,
} from "@/shared/lib/tts/errors";
import {
  isOpenAITtsVoice,
  type TtsProvider,
  type TtsSpeakInput,
  type TtsSpeech,
} from "@/shared/lib/tts/types";

const MIN_SPEECH_SPEED = 0.25;
const MAX_SPEECH_SPEED = 4;

type OpenAISpeechClient = {
  readonly audio: {
    readonly speech: {
      create(params: {
        readonly model: string;
        readonly voice: string;
        readonly input: string;
        readonly speed: number;
        readonly response_format: "mp3";
      }): Promise<{ arrayBuffer(): Promise<ArrayBuffer> }>;
    };
  };
};

export interface OpenAITTSProviderOptions {
  readonly client?: OpenAISpeechClient;
  readonly model?: string;
}

export class OpenAITTSProvider implements TtsProvider {
  private readonly client: OpenAISpeechClient;
  private readonly model: string;

  constructor(options: OpenAITTSProviderOptions = {}) {
    this.client = options.client ?? (getOpenAIServerClient() as OpenAISpeechClient);
    this.model = options.model ?? getOpenAITTSModel();
  }

  async speak(input: TtsSpeakInput): Promise<TtsSpeech> {
    const text = input.text.trim();

    if (!text) {
      throw new TtsEmptyInputError();
    }

    if (!isOpenAITtsVoice(input.voice)) {
      throw new TtsInvalidVoiceError(input.voice);
    }

    if (input.speed < MIN_SPEECH_SPEED || input.speed > MAX_SPEECH_SPEED) {
      throw new TtsInvalidSpeedError(input.speed);
    }

    try {
      const response = await this.client.audio.speech.create({
        model: this.model,
        voice: input.voice,
        input: text,
        speed: input.speed,
        response_format: "mp3",
      });
      const audio = new Uint8Array(await response.arrayBuffer());

      if (audio.byteLength === 0) {
        throw new TtsEmptyAudioError();
      }

      return {
        provider: "openai",
        model: this.model,
        mimeType: "audio/mpeg",
        audio,
      };
    } catch (error) {
      throw mapToTtsProviderError(error);
    }
  }
}
