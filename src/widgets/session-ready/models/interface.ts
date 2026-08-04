import type * as React from "react";

export interface SessionReadyShellProps {
  pillar: "roleplay" | "memo";
  backHref: string;
  backLabel: string;
  currentStep?: number;
  totalSteps: number;
  children: React.ReactNode;
}
