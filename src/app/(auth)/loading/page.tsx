"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";

// features
import { useAuthWithSupabase } from "@/features/login";
import type { SupabaseAuthConnectedProvider } from "@/features/login/models/interface";

const SUPPORTED_PROVIDERS = new Set<SupabaseAuthConnectedProvider>(["google"]);

export default function AuthLoadingPage() {
  const searchParams = useSearchParams();
  const { handleAuthWithSupabase } = useAuthWithSupabase();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const provider = searchParams.get("provider") as SupabaseAuthConnectedProvider | null;

    if (!provider || !SUPPORTED_PROVIDERS.has(provider)) {
      setError("지원하지 않는 로그인 방식입니다.");
      return;
    }

    void handleAuthWithSupabase(provider).then(({ error }) => {
      if (error) {
        setError(error.message);
      }
    });
  }, [searchParams]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50 px-6 text-center">
      {error ? (
        <>
          <p className="text-body-2 font-semibold text-red-600">{error}</p>
          <Link className="text-body-3 font-medium text-black underline" href="/login">
            로그인으로 돌아가기
          </Link>
        </>
      ) : (
        <>
          <Loader2 className="size-30 animate-spin text-black" aria-hidden="true" />
          <p className="text-body-2 font-semibold text-black">구글 로그인으로 이동하고 있습니다.</p>
          <p className="text-body-3 text-gray-600">잠시만 기다려주세요.</p>
        </>
      )}
    </main>
  );
}
