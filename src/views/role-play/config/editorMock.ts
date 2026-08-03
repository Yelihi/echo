import { mockSources } from "@/views/role-play/config/mock";
import type { RoleplayEditorDraft } from "@/views/role-play/models/editor";

export const roleplayEditorEmptyDraft: RoleplayEditorDraft = {
  title: "",
  situation: "",
  tags: [],
  lines: [
    {
      id: "line-partner-1",
      speaker: "partner",
      text: "",
    },
    {
      id: "line-me-1",
      speaker: "me",
      text: "",
    },
  ],
};

export const getRoleplayEditorMockDraft = (
  materialId?: string,
): RoleplayEditorDraft | undefined => {
  const source = mockSources.find((item) => item.id === materialId);

  if (!source) return undefined;

  return {
    title: source.title,
    situation: source.subTitle,
    tags: source.tags.map((tag) => tag.value),
    lines: [
      {
        id: "line-partner-1",
        speaker: "partner",
        text: "Hi! How can I help you today?",
      },
      {
        id: "line-me-1",
        speaker: "me",
        text: "I'd like to practice this conversation.",
      },
    ],
  };
};
