"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { useStore } from "zustand";
import type { CapturedAudio } from "@/shared/lib/audio";
import { decodeTtsAudioBase64 } from "@/shared/lib/tts/decodeTtsAudioBase64";
import { speakRolePlayPartnerLine } from "@/features/roleplay-sessions/services/actions/speakRolePlayPartnerLine";
import { createRolePlayRecordingSessionStore } from "../../models/stores/rolePlayRecordingSessionStore";
import { resolveRoleplayTurn } from "../../models/roleplayTurn";
import type { RolePlayRecordingClientProps } from "../../models/ui";
import { useRecordingTurn } from "./useRecordingTurn";
import { usePartnerAudioPlayback } from "./usePartnerAudioPlayback";
import { useRoleplayRecordingPersistence } from "./useRoleplayRecordingPersistence";
import { showRecordingError } from "../showRecordingError";

export function useRoleplayRecordingController({
  config,
  partner,
  saveRecording,
}: RolePlayRecordingClientProps) {
  const router = useRouter();
  React.useEffect(() => {
    // Browser Back can restore Next.js's cached route. Re-read the saved position.
    if (partner.sessionId) router.refresh();
  }, [partner.sessionId, router]);
  const [store] = React.useState(() =>
    createRolePlayRecordingSessionStore(config.initial, partner.closingPartner),
  );
  const session = useStore(store);
  const { partnerPlaySucceeded, partnerPlayFailed, startTurn } = session;
  const { activeTurn, partnerLine, isLastTurn, phaseOnStart, phaseAfterSave } = resolveRoleplayTurn(
    partner,
    session.currentStep,
    config.initial.totalSteps,
    session.closingPartner,
  );
  const persistence = useRoleplayRecordingPersistence(partner.sessionId);
  const { saveLearnerRecording, completeRecordingSession } = persistence;
  const saveTurn = React.useCallback(
    async (audio: CapturedAudio) => {
      if (saveRecording) await saveRecording(audio);
      else if (partner.sessionId) {
        if (!activeTurn) throw new Error("Missing recording target");
        await saveLearnerRecording(audio, activeTurn.learnerLineId);
      }
      // 녹음 확정 이후 완료 요청이 실패해도 이미 저장한 문장의 재녹음은 허용하지 않는다.
      if (isLastTurn && !activeTurn?.closingPartnerLine)
        await completeRecordingSession().catch(showRecordingError);
    },
    [
      saveRecording,
      partner.sessionId,
      activeTurn,
      saveLearnerRecording,
      isLastTurn,
      completeRecordingSession,
    ],
  );
  const hasPartnerTurn = Boolean(partnerLine);
  const turn = useRecordingTurn({
    store: session,
    demoDurationMs: config.initial.demoDurationMs,
    totalSteps: config.initial.totalSteps,
    nextPhase: phaseAfterSave,
    saveRecording: saveTurn,
  });
  const loadPartnerAudio = React.useCallback(async () => {
    if (!partner.sessionId || !partnerLine) return null;
    const result = await speakRolePlayPartnerLine({
      mode: "session",
      sessionId: partner.sessionId,
      learnerLineId: activeTurn?.learnerLineId,
      closing: session.closingPartner,
    });
    return result.code === "SUCCESS"
      ? decodeTtsAudioBase64(result.audioBase64, result.mimeType)
      : null;
  }, [partnerLine, partner.sessionId, activeTurn?.learnerLineId, session.closingPartner]);
  const onPartnerEnded = React.useCallback(() => {
    partnerPlaySucceeded();
    if (session.closingPartner) void completeRecordingSession().catch(showRecordingError);
  }, [partnerPlaySucceeded, session.closingPartner, completeRecordingSession]);
  const { replay, unlock } = usePartnerAudioPlayback({
    phase: turn.phase,
    sessionId: partner.sessionId,
    partnerLine,
    autoAdvancePartner: partner.autoAdvance,
    loadPartnerAudio,
    onSucceeded: onPartnerEnded,
    onFailed: partnerPlayFailed,
  });
  const beginTurn = React.useCallback(async () => {
    if (hasPartnerTurn) await unlock();
    startTurn(config.initial.totalSteps, phaseOnStart);
  }, [config.initial.totalSteps, hasPartnerTurn, phaseOnStart, startTurn, unlock]);
  const content =
    partner.role && partnerLine
      ? {
          kind: "partner" as const,
          role: partner.role,
          line: partnerLine,
          canReplay: session.canReplayPartner || session.partnerPlaybackBlocked,
          onReplay: () => {
            if (turn.phase === "partner-speaking") void replay();
            else startTurn(config.initial.totalSteps, "partner-speaking");
          },
        }
      : { kind: "title" as const, title: config.ready.title };

  return { session, turn, content, persistence, beginTurn, completeRecordingSession };
}
