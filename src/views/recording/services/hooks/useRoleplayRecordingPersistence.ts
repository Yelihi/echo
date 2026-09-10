"use client";

import { useCallback, useRef, useState } from "react";
import type { RecordingCompletionStatus } from "../../models/ui";
import type { CapturedAudio } from "@/shared/lib/audio";
import { assertRecordingResponse } from "@/features/recording-storage/models/recordingRequestError";

export function useRoleplayRecordingPersistence(sessionId?: string) {
  const recordingIdByBlob = useRef(new WeakMap<Blob, string>());
  const completionRequestInFlight = useRef(false);
  const [completionStatus, setCompletionStatus] = useState<RecordingCompletionStatus>("idle");
  const completeRecordingSession = useCallback(async () => {
    if (!sessionId || completionRequestInFlight.current) return;
    completionRequestInFlight.current = true;
    setCompletionStatus("submitting");
    try {
      const form = new FormData();
      form.set("action", "finish");
      form.set("sessionId", sessionId);
      const response = await fetch("/api/roleplay-recordings", { method: "POST", body: form });
      await assertRecordingResponse(response);
      setCompletionStatus("succeeded");
    } catch (error) {
      setCompletionStatus("failed");
      throw error;
    } finally {
      completionRequestInFlight.current = false;
    }
  }, [sessionId]);
  const saveLearnerRecording = useCallback(
    async (audio: CapturedAudio, lineId: string) => {
      if (!sessionId) return;
      let recordingId = recordingIdByBlob.current.get(audio.blob);
      if (!recordingId) {
        recordingId = crypto.randomUUID();
        recordingIdByBlob.current.set(audio.blob, recordingId);
      }
      const form = new FormData();
      form.set("action", "save");
      form.set("sessionId", sessionId);
      form.set("lineId", lineId);
      form.set("recordingId", recordingId);
      form.set("durationMs", String(Math.round(audio.durationMs)));
      form.set("file", audio.blob, `recording.${audio.extension}`);
      const response = await fetch("/api/roleplay-recordings", { method: "POST", body: form });
      await assertRecordingResponse(response);
    },
    [sessionId],
  );
  return { saveLearnerRecording, completeRecordingSession, completionStatus };
}
