import type { ReactNode } from "react";
import type {
  AudioPreparation,
  AudioPreparationResult,
  ExampleAudioCommand,
} from "@/entities/grammar-audio";

export interface ExampleAudioPreparationProps {
  noteId: string;
  sentenceId: string;
  initial?: AudioPreparation;
  read: (command: ExampleAudioCommand) => Promise<AudioPreparationResult>;
  retry: (command: ExampleAudioCommand) => Promise<AudioPreparationResult>;
  children?: ReactNode;
}

export type AudioPreparationFailure = { code: string; operationId?: string };
