// shared
import { cn } from "@/shared/utils/cn";

// widgets
import { SessionIntroCard } from "@/widgets/session-intro-card/ui/SessionIntroCard";
import type { SessionIntroCardProps } from "@/widgets/session-intro-card/models/interface";

// views
import { getHomeSessionIntroCount } from "@/views/home/services/getHomeSessionIntroCount";

export async function HomeSessionIntroCard({ type }: Pick<SessionIntroCardProps, "type">) {
  const currentSessions = await getHomeSessionIntroCount(type);

  return <SessionIntroCard type={type} currentSessions={currentSessions} />;
}

export function HomeSessionIntroCardFallback({ type }: Pick<SessionIntroCardProps, "type">) {
  return (
    <div
      className={cn(
        "min-h-[200px] w-full animate-pulse rounded-hero",
        type === "role-play" ? "bg-blue-primary" : "bg-deep-blue-primary",
      )}
      aria-hidden
    />
  );
}
