export interface GrammarNoteAudioInput {
  readonly noteId: string;
  readonly sentenceId: string;
  readonly noteVersion: number;
}

export type GrammarAudioErrorCode =
  | "INVALID_INPUT"
  | "UNAUTHORIZED"
  | "NOT_INVITED"
  | "RATE_LIMITED"
  | "GENERATION_FAILED"
  | "PLAYBACK_FAILED";

export interface GrammarSessionAudioInput {
  readonly sessionId: string;
  readonly questionId: string;
}

export type GrammarAudioInput = GrammarNoteAudioInput | GrammarSessionAudioInput;

export type GrammarAudioResult =
  | { ok: true; audioBase64: string; mimeType: "audio/mpeg"; cacheKey: string }
  | { ok: false; code: GrammarAudioErrorCode };

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
