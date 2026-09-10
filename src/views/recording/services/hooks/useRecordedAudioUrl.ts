"use client";

import { useEffect, useState } from "react";

export function useRecordedAudioUrl(blob: Blob): string | undefined {
  const [source, setSource] = useState<{ blob: Blob; url: string }>();
  useEffect(() => {
    const url = URL.createObjectURL(blob);
    setSource({ blob, url });
    return () => URL.revokeObjectURL(url);
  }, [blob]);
  return source?.blob === blob ? source.url : undefined;
}
