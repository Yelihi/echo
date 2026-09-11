"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";

// features
import { useAuthWithSupabase } from "@/features/login";

// views
import { SUPPORTED_PROVIDERS } from "@/views/callback/models/const";
import type { AuthCallbackContentProps } from "@/views/callback/models/interface";

export function AuthCallbackContent({ provider }: AuthCallbackContentProps) {
  const [error, setError] = useState<string | null>(null);
  const { handleAuthWithSupabase } = useAuthWithSupabase();

  useEffect(() => {
    if (!provider || !SUPPORTED_PROVIDERS.has(provider)) {
      setError("지원하지 않는 로그인 방식입니다.");
      return;
    }

    void handleAuthWithSupabase(provider).then(({ error }) => {
      if (error) {
        setError(error.message);
      }
    });
  }, [handleAuthWithSupabase, provider]);

  return (
    <>
      {error ? (
        <>
          <p className="text-body-2 font-semibold text-danger-ink">{error}</p>
          <Link className="text-body-3 font-medium text-black underline" href="/login">
            로그인으로 돌아가기
          </Link>
        </>
      ) : (
        <>
          <Loader2
            className="size-10 animate-spin text-brand motion-reduce:animate-none"
            aria-hidden="true"
          />
          <p className="text-body-3 text-gray-text">잠시만 기다려주세요.</p>
        </>
      )}
    </>
  );
}
