export interface GrammarNoteAudioInput {
  readonly noteId: string;
  readonly sentenceId: string;
  readonly noteVersion: number;
}
export interface GrammarSessionAudioInput {
  readonly sessionId: string;
  readonly questionId: string;
}
export type GrammarAudioInput = GrammarNoteAudioInput | GrammarSessionAudioInput;
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
