import { LucideIcon } from "lucide-react";

export interface SessionSimplifiedProps {
  icon: LucideIcon;
  title: string;
  sessionDate: Date;
  description: string;
  sessionState: "completed" | "cancelled" | "in-progress" | "queued";
}

export const SessionSimplified = () => {};
