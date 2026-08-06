import * as React from "react";

import { cn } from "@/shared/lib/tailwind/utils";

export interface SessionActionsProps {
  secondary?: React.ReactNode;
  primary?: React.ReactNode;
}

export function SessionActions({
  className,
  secondary,
  primary,
  children,
  ...props
}: SessionActionsProps & React.ComponentProps<"footer">) {
  return (
    <footer
      data-slot="session-actions"
      className={cn(
        "flex shrink-0 flex-col-reverse gap-3 py-4 sm:flex-row sm:items-center sm:justify-center",
        className,
      )}
      {...props}
    >
      {children ?? (
        <>
          {secondary}
          {primary}
        </>
      )}
    </footer>
  );
}
