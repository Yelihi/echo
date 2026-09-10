"use client";

import { useFormStatus } from "react-dom";
import { LoaderCircle, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AnalysisRetryButton() {
  const { pending } = useFormStatus();
  return (
    <Button disabled={pending} className="bg-accent-600 text-white hover:bg-accent-700">
      {pending ? (
        <LoaderCircle className="size-4 animate-spin" />
      ) : (
        <RefreshCcw className="size-4" />
      )}
      {pending ? "분석 요청 중" : "다시 분석하기"}
    </Button>
  );
}
