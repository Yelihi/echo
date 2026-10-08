export interface GrammarAudioInput {
  readonly noteId: string;
  readonly sentenceId: string;
  readonly noteVersion: number;
}
export type GrammarAudioResult =
  | { ok: true; audioBase64: string; mimeType: "audio/mpeg"; cacheKey: string }
  | { ok: false; message: string };
export type GrammarAudioStatus =
  | "idle"
  | "generating"
  | "playing"
  | "generation-error"
  | "playback-error";
export interface GrammarAudioButtonProps {
  readonly input: GrammarAudioInput;
  readonly generate: (input: GrammarAudioInput) => Promise<GrammarAudioResult>;
}
