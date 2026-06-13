import type { Database } from "@/shared/lib/supabase";
import type { LineId, MaterialId, SpeakerId, UserId } from "@/entities/value-object";

import type {
  RoleplayLine,
  RoleplayMaterial,
  RoleplaySpeaker,
} from "@/entities/roleplay-material/models/entity";
import { MaterialState } from "@/entities/roleplay-material/models/enums";

export type RoleplayMaterialRow = Database["public"]["Tables"]["roleplay_materials"]["Row"];
export type RoleplayMaterialTagRow = Database["public"]["Tables"]["roleplay_material_tags"]["Row"];
export type RoleplayLineRow = Database["public"]["Tables"]["roleplay_lines"]["Row"];

export interface RoleplayMaterialRowSet {
  readonly material: RoleplayMaterialRow;
  readonly tags: ReadonlyArray<RoleplayMaterialTagRow>;
  readonly lines: ReadonlyArray<RoleplayLineRow>;
}

export function mapRoleplayMaterialRowToEntity(rowSet: RoleplayMaterialRowSet): RoleplayMaterial {
  const materialId = rowSet.material.id as MaterialId;
  const speakers: readonly [RoleplaySpeaker, RoleplaySpeaker] = [
    {
      id: createSpeakerId(materialId, 1),
      order: 1,
      displayName: rowSet.material.speaker_one_name,
    },
    {
      id: createSpeakerId(materialId, 2),
      order: 2,
      displayName: rowSet.material.speaker_two_name,
    },
  ];

  return {
    id: materialId,
    ownerId: rowSet.material.user_id as UserId,
    title: rowSet.material.title,
    situation: rowSet.material.situation,
    tags: [...rowSet.tags]
      .sort((left, right) => left.normalized_name.localeCompare(right.normalized_name))
      .map((tag) => ({
        displayName: tag.display_name,
        normalizedName: tag.normalized_name,
      })),
    speakers,
    lines: [...rowSet.lines]
      .sort((left, right) => left.line_order - right.line_order)
      .map((line) => mapRoleplayLineRowToEntity(line, materialId)),
    state: rowSet.material.status as MaterialState,
    deletedAt: rowSet.material.deleted_at ? new Date(rowSet.material.deleted_at) : null,
    createdAt: new Date(rowSet.material.created_at),
    updatedAt: new Date(rowSet.material.updated_at),
  };
}

function mapRoleplayLineRowToEntity(line: RoleplayLineRow, materialId: MaterialId): RoleplayLine {
  return {
    id: line.id as LineId,
    order: line.line_order,
    speakerId: createSpeakerId(materialId, mapSpeakerOrder(line.speaker_order)),
    text: line.text,
    translation: line.translation,
  };
}

function createSpeakerId(materialId: MaterialId, speakerOrder: 1 | 2): SpeakerId {
  return `${materialId}:speaker:${speakerOrder}` as SpeakerId;
}

function mapSpeakerOrder(speakerOrder: number): 1 | 2 {
  if (speakerOrder === 1 || speakerOrder === 2) {
    return speakerOrder;
  }

  throw new Error(`Invalid roleplay speaker order: ${speakerOrder}`);
}
