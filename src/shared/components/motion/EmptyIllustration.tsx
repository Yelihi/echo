"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import type { DotLottie } from "@lottiefiles/dotlottie-react";

const Player = dynamic(
  () =>
    import("@lottiefiles/dotlottie-react").then((module) => {
      module.setWasmUrl("/animations/dotlottie-player.wasm");
      return module.DotLottieReact;
    }),
  { ssr: false },
);

/** Decorative, local dotLottie; the surrounding empty-state text is always available. */
export function EmptyIllustration({ loop = false }: { loop?: boolean }) {
  const [player, setPlayer] = useState<DotLottie | null>(null);

  useEffect(() => {
    if (!player) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => {
      if (!reduced.matches) player.play();
      else {
        player.pause();
        player.setFrame(25);
      }
    };
    player.addEventListener("load", sync);
    reduced.addEventListener("change", sync);
    if (player.isLoaded) sync();
    return () => {
      player.removeEventListener("load", sync);
      reduced.removeEventListener("change", sync);
    };
  }, [player]);

  return (
    <div aria-hidden="true" className="h-30 w-40 shrink-0" data-slot="empty-illustration">
      <Player
        src="/animations/empty-status.lottie"
        autoplay={false}
        loop={loop}
        speed={0.85}
        dotLottieRefCallback={setPlayer}
      />
    </div>
  );
}
