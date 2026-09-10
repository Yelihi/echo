import type { RecordingPhase } from "@/views/recording/models/interface";

export interface RecordingSessionClientConfig {
  navigation: {
    backHref: string;
    closeHref: string;
  };
  ready: {
    label: string;
    title: string;
    description: readonly string[];
    meta: readonly string[];
    previewLabel: string;
    previewLines: readonly { label: string; text: string }[];
  };
  initial: {
    initialPhase: RecordingPhase;
    activeStep: number;
    totalSteps: number;
    demoDurationMs: number;
  };
}
