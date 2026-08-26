import type { SourceCardProps } from "@/widgets/source-card/models/interface";

export interface MemorizationViewProps {
  page: number;
  tags: string[];
}

export interface GetMemorizationSessionsParams {
  page: number;
  limit?: number;
  tags?: string[];
}

export interface MemorizationMaterialListResult {
  cards: Omit<SourceCardProps, "onMenuAction" | "innerMenuItems">[];
  page: number;
  totalCount: number;
  totalPages: number;
}

export interface SourceCardsWrapperProps {
  cards: Omit<SourceCardProps, "onMenuAction" | "innerMenuItems">[];
}

export type MemorizationSessionTheme = "red" | "blue" | "green" | "yellow" | "black";
