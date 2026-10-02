"use client";

import { useActionState } from "react";
import type { AnalysisResultViewProps } from "../models/interface";
import { LoaderCircle, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AnalysisRetryButton({ retryAction }: Pick<AnalysisResultViewProps, "retryAction">) {
  const [message, submit, pending] = useActionState(async () => {
    try {
      return (await retryAction()) ?? "";
    } catch {
      return "분석 요청에 실패했습니다. 기존 결과는 유지됩니다. 잠시 후 다시 시도해주세요.";
    }
  }, "");
  return (
    <form action={submit}>
      <Button disabled={pending} className="bg-accent-600 text-white hover:bg-accent-700">
        {pending ? (
          <LoaderCircle className="size-4 animate-spin" />
        ) : (
          <RefreshCcw className="size-4" />
        )}
        {pending ? "분석 요청 중" : "다시 분석하기"}
      </Button>
      {message ? (
        <p role="alert" className="mt-2 text-sm text-gray-text">
          {message}
        </p>
      ) : null}
    </form>
  );
}
