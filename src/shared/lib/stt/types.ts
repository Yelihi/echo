export type STTProviderName = "openai";

export interface STTProviderInput {
  readonly audio: Blob | Uint8Array | ArrayBuffer;
  readonly filename: string;
  readonly mimeType: string;
}

export interface STTTranscript {
  readonly provider: STTProviderName;
  readonly model: string;
  readonly text: string;
}

export interface STTProvider {
  transcribe(input: STTProviderInput): Promise<STTTranscript>;
}
