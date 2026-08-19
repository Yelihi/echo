import { LucideIcon } from "lucide-react";

export interface EmptyContainerProps {
  title: string;
  description?: string;
}

export interface ListContainerProps {
  type: "role-play" | "memorization";
  icon: LucideIcon;
  title: string;
  empty?: EmptyContainerProps;
  children?: React.ReactNode;
}

export interface SourceItemProps {
  icon: LucideIcon;
  type: "role-play" | "memorization";
  title: string;
  subTitle: string;
}
