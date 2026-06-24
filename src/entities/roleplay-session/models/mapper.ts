import type { Database } from "@/shared/lib/supabase";
import type { LineId, MaterialId, SessionId, SpeakerId, UserId } from "@/entities/value-object";

import type {
  RoleplayLineSnapshot,
  RoleplaySession,
  RoleplaySpeakerSnapshot,
} from "@/entities/roleplay-session/models/entity";
import { SessionState } from "@/entities/roleplay-session/models/enums";

export type RoleplaySessionRow = Database["public"]["Tables"]["roleplay_sessions"]["Row"];
export type RoleplaySessionTagRow = Database["public"]["Tables"]["roleplay_session_tags"]["Row"];
export type RoleplaySessionLineRow = Database["public"]["Tables"]["roleplay_session_lines"]["Row"];

export interface RoleplaySessionRowSet {
  readonly session: RoleplaySessionRow;
  readonly tags: ReadonlyArray<RoleplaySessionTagRow>;
  readonly lines: ReadonlyArray<RoleplaySessionLineRow>;
}

export function mapRoleplaySessionRowToEntity(rowSet: RoleplaySessionRowSet): RoleplaySession {
  const sessionId = rowSet.session.id as SessionId;
  const speakerSnapshots: readonly [RoleplaySpeakerSnapshot, RoleplaySpeakerSnapshot] = [
    {
      id: createSpeakerSnapshotId(sessionId, 1),
      order: 1,
      displayName: rowSet.session.speaker_one_name_snapshot,
    },
    {
      id: createSpeakerSnapshotId(sessionId, 2),
      order: 2,
      displayName: rowSet.session.speaker_two_name_snapshot,
    },
  ];

  return {
    id: sessionId,
    ownerId: rowSet.session.user_id as UserId,
    sourceMaterialId: rowSet.session.material_id
      ? (rowSet.session.material_id as MaterialId)
      : null,
    materialTitleSnapshot: rowSet.session.material_title_snapshot,
    situationSnapshot: rowSet.session.situation_snapshot,
    tagsSnapshot: [...rowSet.tags]
      .sort((left, right) => left.normalized_name.localeCompare(right.normalized_name))
      .map((tag) => ({
        displayName: tag.display_name,
        normalizedName: tag.normalized_name,
      })),
    selectedLearnerSpeakerOrder: mapSpeakerOrder(rowSet.session.selected_learner_speaker_order),
    speakerSnapshots,
    lineSnapshots: [...rowSet.lines]
      .sort((left, right) => left.line_order - right.line_order)
      .map(mapRoleplaySessionLineRowToEntity),
    currentLineOrder: rowSet.session.current_line_order,
    state: rowSet.session.status as SessionState,
    startedAt: rowSet.session.started_at ? new Date(rowSet.session.started_at) : null,
    completedAt: rowSet.session.completed_at ? new Date(rowSet.session.completed_at) : null,
    deletedAt: rowSet.session.deleted_at ? new Date(rowSet.session.deleted_at) : null,
    createdAt: new Date(rowSet.session.created_at),
    updatedAt: new Date(rowSet.session.updated_at),
  };
}

function mapRoleplaySessionLineRowToEntity(line: RoleplaySessionLineRow): RoleplayLineSnapshot {
  return {
    id: line.id as LineId,
    order: line.line_order,
    speakerOrder: mapSpeakerOrder(line.speaker_order),
    text: line.text_snapshot,
    translation: line.translation_snapshot,
  };
}

function createSpeakerSnapshotId(sessionId: SessionId, speakerOrder: 1 | 2): SpeakerId {
  return `${sessionId}:speaker:${speakerOrder}` as SpeakerId;
}

function mapSpeakerOrder(speakerOrder: number): 1 | 2 {
  if (speakerOrder === 1 || speakerOrder === 2) {
    return speakerOrder;
  }

  throw new Error(`Invalid roleplay session speaker order: ${speakerOrder}`);
}
