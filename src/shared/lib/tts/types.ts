export type TtsProviderName = "openai";

export const OPENAI_TTS_VOICES = [
  "alloy",
  "ash",
  "ballad",
  "coral",
  "echo",
  "fable",
  "onyx",
  "nova",
  "sage",
  "shimmer",
  "verse",
  "marin",
  "cedar",
] as const;

export type OpenAITtsVoice = (typeof OPENAI_TTS_VOICES)[number];

export interface TtsSpeakInput {
  readonly text: string;
  readonly voice: OpenAITtsVoice;
  readonly speed: number;
}

export interface TtsSpeech {
  readonly provider: TtsProviderName;
  readonly model: string;
  readonly mimeType: "audio/mpeg";
  readonly audio: Uint8Array;
}

export interface TtsProvider {
  speak(input: TtsSpeakInput): Promise<TtsSpeech>;
}

export function isOpenAITtsVoice(voice: string): voice is OpenAITtsVoice {
  return OPENAI_TTS_VOICES.includes(voice as OpenAITtsVoice);
}
