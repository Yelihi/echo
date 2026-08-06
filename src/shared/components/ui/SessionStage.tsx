import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/shared/lib/tailwind/utils";

export const sessionStageVariants = cva(
  "relative flex min-h-lvh w-full flex-col overflow-hidden bg-session-bg text-white",
  {
    variants: {
      pillar: {
        roleplay: "",
        memo: "",
      },
    },
    defaultVariants: {
      pillar: "roleplay",
    },
  },
);

export interface SessionStageProps extends VariantProps<typeof sessionStageVariants> {
  children: React.ReactNode;
}

export function SessionStage({
  className,
  children,
  pillar = "roleplay",
  ...props
}: SessionStageProps & React.ComponentProps<"main">) {
  return (
    <main
      data-slot="session-stage"
      data-pillar={pillar === "memo" ? "memo" : undefined}
      className={cn(sessionStageVariants({ pillar }), className)}
      {...props}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-accent-glow/10" />
      <div className="relative mx-auto flex min-h-lvh w-full max-w-5xl flex-1 flex-col px-5 py-5 sm:px-8 sm:py-7">
        {children}
      </div>
    </main>
  );
}
