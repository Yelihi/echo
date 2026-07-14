import { LucideIcon } from "lucide-react";

export interface SourceTag {
  value: string;
  label: string;
}

export interface SourceCardProps {
  id: string;
  tags: SourceTag[];
  title: string;
  subTitle: string;
  theme: "red" | "blue" | "green" | "yellow" | "black";
  contentValue: number;
  innerMenuItems: Omit<InnerMenuItemProps, "onClick">[];
  onMenuAction: (value: string, id: string) => void;
}

export interface SourceCardInnerMenuButtonProps {
  id: string;
  onMenuAction: (value: string, id: string) => void;
  innerMenuItems: Omit<InnerMenuItemProps, "onClick">[];
}

export interface InnerMenuItemProps {
  value: string;
  text: string;
  icon: LucideIcon;
  theme: "default" | "destructive";
  onClick: (value: string) => void;
}

export interface InnerMenuContainerProps {
  children: React.ReactNode;
  isOpen: boolean;
}
