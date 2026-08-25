// entities
import type { CreateRoleplayMaterialInput, RoleplayMaterial } from "@/entities/roleplay-material";
import { createTagValue, type UserId } from "@/entities/value-object";

// views
import {
  ROLE_PLAY_SPEAKER_ONE_NAME,
  ROLE_PLAY_SPEAKER_TWO_NAME,
} from "@/views/role-play/config/const";
import type { RoleplayEditorDraftInput } from "@/views/role-play/config/schema";
import type { RoleplayEditorDraft } from "@/views/role-play/models/interface";

export function convertRolePlayEditorDraftToCreateInput(
  draft: RoleplayEditorDraftInput,
  ownerId: UserId,
): CreateRoleplayMaterialInput {
  const tags = new Map(
    draft.tags.map((tag) => {
      const value = createTagValue(tag);
      return [value.normalizedName, value] as const;
    }),
  );

  return {
    ownerId,
    title: draft.title,
    situation: draft.situation,
    speakerOneName: ROLE_PLAY_SPEAKER_ONE_NAME,
    speakerTwoName: ROLE_PLAY_SPEAKER_TWO_NAME,
    tags: [...tags.values()],
    lines: draft.lines.map((line, index) => ({
      order: index,
      speakerOrder: line.speaker === "partner" ? 1 : 2,
      text: line.text,
    })),
  };
}

export function convertRolePlayMaterialToEditorDraft(
  material: RoleplayMaterial,
): RoleplayEditorDraft {
  const speakerOrderById = new Map(
    material.speakers.map((speaker) => [speaker.id, speaker.order] as const),
  );

  return {
    title: material.title,
    situation: material.situation,
    tags: material.tags.map((tag) => tag.displayName),
    lines: material.lines.map((line) => ({
      id: line.id,
      speaker: speakerOrderById.get(line.speakerId) === 2 ? "me" : "partner",
      text: line.text,
    })),
  };
}
