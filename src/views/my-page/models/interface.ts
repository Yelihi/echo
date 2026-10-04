import type { ReactNode } from "react";
import type { GetLatestStudySession } from "@/widgets/latest-sessions/models/studySession";

export interface MyPageMaterialItem {
  id: string;
  title: string;
  description: string;
  date: Date;
  href: string;
}

export type MaterialKind = "roleplay" | "memorization";
export interface MyPageContentProps {
  roleplay: ReactNode;
  memorization: ReactNode;
  history: ReactNode;
}
export interface MyPageSectionHeadingProps {
  id: string;
  title: string;
  href: string;
}
export interface MyPageMaterialRowsProps {
  items: readonly MyPageMaterialItem[];
}
export interface MyPageHistoryRowsProps {
  sessions: readonly GetLatestStudySession[];
}
