"use client";
import type { MemorizationRecordingClientProps } from "@/views/recording/models/ui";

import * as React from "react";
import { useStore } from "zustand";

import { getRecordingSessionHint } from "@/views/recording/models/recordingSessionMessage";
import { createMemorizationRecordingSessionStore } from "@/views/recording/models/stores/memorizationRecordingSessionStore";
import { RecordingPanel } from "@/views/recording/ui/common/RecordingPanel";
import { RecordingReadyPanel } from "@/views/recording/ui/common/RecordingReadyPanel";
import { SessionTopBar } from "@/views/recording/ui/common/SessionTopBar";
import { useRecordingTurn } from "@/views/recording/services/hooks/useRecordingTurn";
import { RecordingCompletionPanel } from "@/views/recording/ui/common/RecordingCompletionPanel";

export function MemorizationRecordingClient({
  config,
  saveRecording,
}: MemorizationRecordingClientProps) {
  const [store] = React.useState(() => createMemorizationRecordingSessionStore(config.initial));
  const session = useStore(store);
  const { startTurn } = session;
  const turn = useRecordingTurn({
    store: session,
    demoDurationMs: config.initial.demoDurationMs,
    totalSteps: config.initial.totalSteps,
    nextPhase: "user-ready",
    saveRecording,
  });
  const beginTurn = React.useCallback(() => {
    startTurn(config.initial.totalSteps, "user-ready");
  }, [config.initial.totalSteps, startTurn]);

  return (
    <>
      <SessionTopBar
        backHref={turn.phase === "ready" ? config.navigation.backHref : config.navigation.closeHref}
        close={turn.phase !== "ready"}
        current={turn.phase === "ready" ? 0 : session.currentStep}
        total={config.initial.totalSteps}
      />
      {turn.phase === "ready" ? (
        <RecordingReadyPanel content={config.ready} onStart={beginTurn} />
      ) : turn.phase === "completed" ? (
        <RecordingCompletionPanel />
      ) : (
        <RecordingPanel
          content={{ kind: "title", title: config.ready.title }}
          phase={turn.phase}
          durationLabel={turn.durationLabel}
          message={getRecordingSessionHint(turn.phase, turn.recordingState, session.saveFailed)}
          saving={session.saving}
          recordedAudio={turn.recordedAudio}
          actions={{ toggle: turn.toggle, retry: turn.retry, save: turn.save }}
        />
      )}
    </>
  );
}
