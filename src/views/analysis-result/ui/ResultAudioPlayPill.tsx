"use client";

import { useEffect, useRef, useState } from "react";

import { PlayPill } from "@/shared/components/ui";
import type { ResultAudioPlayPillProps } from "@/views/analysis-result/models";

export function ResultAudioPlayPill({ signedUrl, durationSec }: ResultAudioPlayPillProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playbackUrl, setPlaybackUrl] = useState(signedUrl);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(durationSec ?? 0);

  useEffect(() => {
    if (!playing && signedUrl !== playbackUrl) {
      setPlaybackUrl(signedUrl);
      setProgress(0);
    }
  }, [playbackUrl, playing, signedUrl]);

  useEffect(() => {
    const audio = new Audio(playbackUrl);
    audioRef.current = audio;

    const sync = () => {
      const nextDuration = Number.isFinite(audio.duration) ? audio.duration : (durationSec ?? 0);

      setDuration(nextDuration);
      setProgress(nextDuration > 0 ? (audio.currentTime / nextDuration) * 100 : 0);
    };
    const stop = () => setPlaying(false);

    audio.addEventListener("timeupdate", sync);
    audio.addEventListener("loadedmetadata", sync);
    audio.addEventListener("ended", stop);

    return () => {
      audio.pause();
      audio.removeEventListener("timeupdate", sync);
      audio.removeEventListener("loadedmetadata", sync);
      audio.removeEventListener("ended", stop);
    };
  }, [durationSec, playbackUrl]);

  const toggle = async () => {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    if (playing) {
      audio.pause();
      setPlaying(false);
      return;
    }

    await audio.play();
    setPlaying(true);
  };

  return (
    <PlayPill
      playing={playing}
      progress={progress}
      duration={formatDuration(duration)}
      onToggle={toggle}
    />
  );
}

function formatDuration(totalSeconds: number): string {
  const seconds = Math.max(0, Math.round(totalSeconds));
  const minutes = Math.floor(seconds / 60);

  return `${minutes}:${String(seconds % 60).padStart(2, "0")}`;
}
