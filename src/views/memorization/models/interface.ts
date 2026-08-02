import type { SourceCardProps } from "@/widgets/source-card/models/interface";

export interface MemorizationCardsWrapperProps {
  cards: Omit<SourceCardProps, "onMenuAction" | "innerMenuItems">[];
}
