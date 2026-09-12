"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const GUARD_KEY = "echoRecordingExit";

export function useRecordingExit(hasUnsavedRecording: boolean, saving: boolean) {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const risk = useRef({ hasUnsavedRecording, saving });
  const guarded = useRef(false);
  const releaseCallback = useRef<(() => void) | null>(null);
  const destination = useRef<(() => void) | null>(null);

  // Remove our same-URL history entry before performing an approved navigation.
  const release = useCallback((after: () => void = () => {}) => {
    if (releaseCallback.current) return;
    if (!guarded.current) return after();
    releaseCallback.current = after;
    window.history.back();
  }, []);

  useEffect(() => {
    risk.current = { hasUnsavedRecording, saving };
    if (hasUnsavedRecording || saving) {
      if (!guarded.current && !releaseCallback.current) {
        if (window.history.state?.[GUARD_KEY] !== window.location.href) {
          // Preserve Next.js history data. A duplicate entry lets Back be canceled
          // before it leaves this document, including on browsers without Navigation API.
          window.history.pushState(
            { ...window.history.state, [GUARD_KEY]: window.location.href },
            "",
            window.location.href,
          );
        }
        guarded.current = true;
      }
    } else {
      guarded.current ||= window.history.state?.[GUARD_KEY] === window.location.href;
    }
  }, [hasUnsavedRecording, saving]);

  useEffect(() => {
    const beforeUnload = (event: BeforeUnloadEvent) => {
      if (!risk.current.hasUnsavedRecording && !risk.current.saving) return;
      event.preventDefault();
      event.returnValue = "";
    };
    const popState = (event: PopStateEvent) => {
      if (releaseCallback.current) {
        event.stopImmediatePropagation();
        guarded.current = false;
        const after = releaseCallback.current;
        releaseCallback.current = null;
        after();
        return;
      }
      if (!guarded.current || window.history.state?.[GUARD_KEY]) return;
      event.stopImmediatePropagation();
      if (!risk.current.hasUnsavedRecording && !risk.current.saving) {
        guarded.current = false;
        window.history.back();
        return;
      }
      window.history.pushState(
        { ...window.history.state, [GUARD_KEY]: window.location.href },
        "",
        window.location.href,
      );
      if (risk.current.saving) {
        setBlocked(true);
        return;
      }
      destination.current = () => window.history.back();
      setConfirmOpen(true);
    };
    // A bfcache restoration must re-read accepted recordings from the server.
    const pageShow = (event: PageTransitionEvent) => {
      if (event.persisted) router.refresh();
    };
    window.addEventListener("beforeunload", beforeUnload);
    window.addEventListener("popstate", popState, true);
    window.addEventListener("pageshow", pageShow);
    return () => {
      window.removeEventListener("beforeunload", beforeUnload);
      window.removeEventListener("popstate", popState, true);
      window.removeEventListener("pageshow", pageShow);
    };
  }, [router]);

  const requestExit = (href: string, confirm: boolean) => {
    if (saving || releaseCallback.current) {
      setBlocked(true);
      return;
    }
    destination.current = () => router.push(href);
    if (confirm || hasUnsavedRecording) setConfirmOpen(true);
    else release(destination.current);
  };
  const confirmExit = () => {
    if (risk.current.saving) return;
    // User explicitly discards unsaved audio; don't show a second native prompt.
    risk.current = { hasUnsavedRecording: false, saving: false };
    release(() => destination.current?.());
  };
  return { confirmOpen, setConfirmOpen, blocked, requestExit, confirmExit };
}
