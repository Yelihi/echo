import type { ReactNode } from "react";

export interface MyPageMaterialItem {
  id: string;
  title: string;
  description: string;
  date: Date;
  href: string;
}

export type MaterialKind = "roleplay" | "memorization";
export interface PracticeCompletion {
  kind: MaterialKind | "grammar";
  completedAt: string;
}
export interface PracticeCompletionSource {
  kind: PracticeCompletion["kind"];
  table: "roleplay_sessions" | "memorization_sessions" | "grammar_sessions";
}
export interface PracticeStats {
  total: number;
  weeks: {
    startsOn: string;
    roleplay: number;
    memorization: number;
    grammar: number;
  }[];
}
export interface MyPageContentProps {
  roleplay: ReactNode;
  memorization: ReactNode;
  statistics: ReactNode;
}
export interface MyPageSectionHeadingProps {
  id: string;
  title: string;
  href: string;
}
export interface MyPageMaterialRowsProps {
  items: readonly MyPageMaterialItem[];
}
