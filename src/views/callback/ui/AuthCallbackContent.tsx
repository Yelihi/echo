"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Wordmark } from "@/shared/components/ui/Wordmark";
import { LoaderCircle } from "lucide-react";

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
          <Wordmark />
          <h1 className="text-heading-md font-normal">로그인을 완료하지 못했어요</h1>
          <p role="alert" className="text-body-3 text-danger-ink">
            {error}
          </p>
          <Link className="text-body-3 font-medium text-black underline" href="/login">
            로그인으로 돌아가기
          </Link>
        </>
      ) : (
        <section
          className="flex w-full max-w-lg flex-col items-center bg-card-surface px-6 py-16"
          role="status"
          aria-live="polite"
        >
          <Wordmark />
          <div className="my-6">
            <LoaderCircle
              aria-hidden
              className="size-7 animate-spin text-brand motion-reduce:animate-none"
            />
          </div>
          <h1 className="text-heading-md font-normal text-black-primary">로그인 준비 중이에요</h1>
          <p className="mt-3 text-body-3 leading-relaxed text-gray-text">
            Google 로그인 화면으로 연결하고 있어요.
            <br />
            잠시만 기다려주세요.
          </p>
        </section>
      )}
    </>
  );
}
