"use client";

import { useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";

export function useResultAutoRefresh() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (pending) return;
    const id = window.setTimeout(() => {
      startTransition(() => router.refresh());
    }, 5000);
    return () => window.clearTimeout(id);
  }, [pending, router]);
}
