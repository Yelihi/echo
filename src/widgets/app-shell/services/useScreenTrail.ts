"use client";
import { useEffect, useState } from "react";
import { advanceScreenTrail, getScreenBackHref } from "../models/screenNavigation";

/** Owned by the persistent navigation leaf; also works with state-only screen IDs. */
export function useScreenTrail(pathname: string) {
  const [trail, setTrail] = useState<string[]>([pathname]);
  useEffect(() => {
    setTrail((previous) =>
      previous.at(-1) === pathname ? previous : advanceScreenTrail(previous, pathname),
    );
  }, [pathname]);
  return getScreenBackHref(trail, pathname);
}
