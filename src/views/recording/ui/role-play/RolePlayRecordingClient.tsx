"use client";
import type { RolePlayRecordingClientProps } from "../../models/ui";
import { useRoleplayRecordingController } from "../../services/hooks/useRoleplayRecordingController";
import { getRecordingSessionHint } from "../../models/recordingSessionMessage";
import { showRecordingError } from "../../services/showRecordingError";
import { RecordingPanel } from "../common/RecordingPanel";
import { RecordingReadyPanel } from "../common/RecordingReadyPanel";
import { RecordingCompletionPanel } from "../common/RecordingCompletionPanel";
import { SessionTopBar } from "../common/SessionTopBar";

export function RolePlayRecordingClient(props: RolePlayRecordingClientProps) {
  const { config, partner } = props;
  const { session, turn, content, persistence, beginTurn, completeRecordingSession } =
    useRoleplayRecordingController(props);

  return (
    <>
      <SessionTopBar
        backHref={turn.phase === "ready" ? config.navigation.backHref : config.navigation.closeHref}
        close={turn.phase !== "ready"}
        current={
          turn.phase === "ready" && !session.closingPartner
            ? Math.max(0, session.currentStep - 1)
            : session.currentStep
        }
        total={config.initial.totalSteps}
        hasUnsavedRecording={turn.phase === "recording" || Boolean(turn.recordedAudio)}
        saving={session.saving || persistence.completionStatus === "submitting"}
        resumable={Boolean(partner.sessionId)}
      />
      {turn.phase === "ready" ? (
        <RecordingReadyPanel content={config.ready} onStart={beginTurn} />
      ) : turn.phase === "completed" ? (
        <RecordingCompletionPanel
          status={persistence.completionStatus}
          resultHref={
            persistence.completionStatus === "succeeded" && partner.sessionId
              ? `/roleplay-sessions/${partner.sessionId}/result`
              : undefined
          }
          onRetry={
            partner.sessionId
              ? () => {
                  void completeRecordingSession().catch(showRecordingError);
                }
              : undefined
          }
        />
      ) : (
        <RecordingPanel
          content={content}
          phase={turn.phase}
          durationLabel={turn.durationLabel}
          message={getRecordingSessionHint(
            turn.phase,
            turn.recordingState,
            session.saveFailed,
            session.partnerPlaybackBlocked,
          )}
          saving={session.saving}
          recordedAudio={turn.recordedAudio}
          actions={{ toggle: turn.toggle, retry: turn.retry, save: turn.save }}
        />
      )}
    </>
  );
}
