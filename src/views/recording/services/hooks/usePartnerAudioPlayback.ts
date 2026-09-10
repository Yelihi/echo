"use client";
import type { UsePartnerAudioPlaybackInput } from "@/views/recording/models/hooks";

import * as React from "react";

const SILENT_WAV =
  "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA";

export function usePartnerAudioPlayback({
  phase,
  sessionId,
  partnerLine,
  autoAdvancePartner,
  loadPartnerAudio,
  onSucceeded,
  onFailed,
}: UsePartnerAudioPlaybackInput) {
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const objectUrlRef = React.useRef<string | null>(null);
  const blobRef = React.useRef<{ loader: typeof loadPartnerAudio; blob: Blob } | null>(null);
  const playIdRef = React.useRef(0);

  const getAudio = React.useCallback(() => {
    audioRef.current ??= new Audio();
    return audioRef.current;
  }, []);

  const unlock = React.useCallback(async () => {
    const audio = getAudio();
    audio.src = SILENT_WAV;

    try {
      await audio.play();
      audio.pause();
      audio.currentTime = 0;
    } catch {
      // best effort only
    }
  }, [getAudio]);

  const playBlob = React.useCallback(
    async (blob: Blob, playId: number) => {
      const audio = getAudio();

      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);

      objectUrlRef.current = URL.createObjectURL(blob);
      audio.src = objectUrlRef.current;
      audio.currentTime = 0;
      audio.onended = () => {
        if (playId === playIdRef.current && phase === "partner-speaking") onSucceeded();
      };
      audio.onerror = () => {
        if (playId === playIdRef.current) onFailed();
      };

      try {
        await audio.play();
        return true;
      } catch {
        return false;
      }
    },
    [getAudio, onFailed, onSucceeded, phase],
  );

  const playPartner = React.useCallback(async () => {
    if (!loadPartnerAudio) return onFailed();

    const playId = playIdRef.current + 1;
    playIdRef.current = playId;
    try {
      const blob =
        blobRef.current?.loader === loadPartnerAudio
          ? blobRef.current.blob
          : await loadPartnerAudio();
      if (playId !== playIdRef.current) return;
      if (!blob) return onFailed();

      blobRef.current = { loader: loadPartnerAudio, blob };
      const played = await playBlob(blob, playId);
      if (playId === playIdRef.current && !played) onFailed();
    } catch {
      if (playId === playIdRef.current) onFailed();
    }
  }, [loadPartnerAudio, onFailed, playBlob]);

  React.useEffect(() => {
    if (phase !== "partner-speaking") return;

    if (!sessionId || !partnerLine || !loadPartnerAudio) {
      if (!autoAdvancePartner) return;
      const timeoutId = window.setTimeout(onSucceeded, 1400);
      return () => window.clearTimeout(timeoutId);
    }

    const audio = getAudio();
    void playPartner();

    return () => {
      playIdRef.current += 1;
      audio.pause();
      audio.onended = null;
      audio.onerror = null;
    };
  }, [
    autoAdvancePartner,
    getAudio,
    loadPartnerAudio,
    onSucceeded,
    partnerLine,
    phase,
    playPartner,
    sessionId,
  ]);

  React.useEffect(() => {
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
  }, []);

  return { replay: playPartner, unlock };
}
