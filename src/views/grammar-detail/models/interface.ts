import type { ReactNode } from "react";
import type { GrammarNote } from "@/entities/grammar-note";

export interface GrammarDetailProps {
  note: GrammarNote;
  backHref: string;
  analysis: ReactNode;
  audio: ReactNode;
  examples: ReactNode;
  history: ReactNode;
}
