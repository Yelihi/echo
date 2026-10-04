export type { GetLatestStudySession } from "@/widgets/latest-sessions/models/studySession";

export interface PracticeMode {
  id: string;
  name: string;
  label: string;
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  imageTitle: string;
  href: string;
  note: string;
}
export interface PracticeModePhotoProps {
  active: number;
  onStep: (direction: number) => void;
}
export interface PracticeModeControlsProps {
  active: number;
  onStep: (direction: number) => void;
}
export interface PracticeModeDetailsProps {
  mode: PracticeMode;
}
export interface PracticeModeNavigationProps {
  active: number;
  onSelect: (index: number) => void;
}
