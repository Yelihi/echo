import type { MaterialLibraryHeaderProps } from "@/widgets/material-library/models/interface";

export const memorizationLibraryHeader = {
  eyebrow: "MEMORIZATION",
  title: "문단 암기",
  description: "기억하고 싶은 글을 고르고, 한 문단씩 내 것으로 만드세요.",
  createHref: "/sentence-memorization/new",
} satisfies MaterialLibraryHeaderProps;
