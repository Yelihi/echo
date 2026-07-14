import type { SourceCardProps } from "@/widgets/source-card/models/interface";

export interface SourceCardsWrapperProps {
  cards: Omit<SourceCardProps, "onMenuAction" | "innerMenuItems">[];
}
