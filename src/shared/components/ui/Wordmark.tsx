import { cn } from "@/shared/lib/tailwind/utils";

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("text-3xl font-medium tracking-tighter text-black-primary", className)}>
      echo<span className="text-brand">.</span>
    </span>
  );
}
