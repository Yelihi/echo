import type { MaterialId, TagValue, UserId } from "@/entities/value-object";

import type { MemorizationMaterial } from "@/entities/memorization-material/models/entity";
import type { MaterialState } from "@/entities/memorization-material/models/enums";

export interface FindMemorizationMaterialsParams {
  readonly state?: MaterialState;
  readonly tagNormalizedNames?: ReadonlyArray<string>;
  readonly page?: number;
  readonly limit?: number;
}

export interface CreateMemorizationMaterialSentenceInput {
  readonly order: number;
  readonly text: string;
  readonly translation?: string | null;
}

export interface CreateMemorizationMaterialParagraphInput {
  readonly order: number;
  readonly sentences: ReadonlyArray<CreateMemorizationMaterialSentenceInput>;
}

export interface CreateMemorizationMaterialInput {
  readonly ownerId: UserId;
  readonly title: string;
  readonly tags: ReadonlyArray<TagValue>;
  readonly paragraphs: ReadonlyArray<CreateMemorizationMaterialParagraphInput>;
}

export interface MemorizationMaterialRepositoryPort {
  findById(id: MaterialId): Promise<MemorizationMaterial | null>;
  findMany(params?: FindMemorizationMaterialsParams): Promise<MemorizationMaterial[]>;
  countActive(): Promise<number>;
  count(params?: FindMemorizationMaterialsParams): Promise<number>;
  findDistinctTags(state?: MaterialState): Promise<TagValue[]>;
  create(input: CreateMemorizationMaterialInput): Promise<MemorizationMaterial>;
}
