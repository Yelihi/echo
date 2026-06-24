import type { LineId, MaterialId, SpeakerId, TagValue, UserId } from "@/entities/value-object";

import type { MaterialState } from "@/entities/roleplay-material/models/enums";

export interface RoleplaySpeaker {
  readonly id: SpeakerId;
  readonly order: 1 | 2;
  readonly displayName: string;
}

export interface RoleplayLine {
  readonly id: LineId;
  readonly order: number;
  readonly speakerId: SpeakerId;
  readonly text: string;
  readonly translation: string | null;
}

export interface RoleplayMaterial {
  readonly id: MaterialId;
  readonly ownerId: UserId;
  readonly title: string;
  readonly situation: string;
  readonly tags: ReadonlyArray<TagValue>;
  readonly speakers: readonly [RoleplaySpeaker, RoleplaySpeaker];
  readonly lines: ReadonlyArray<RoleplayLine>;
  readonly state: MaterialState;
  readonly deletedAt: Date | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}
