// entities
import type { RoleplayMaterial } from "@/entities/roleplay-material/models/entity";
import type { MaterialState } from "@/entities/roleplay-material/models/enums";
import type { MaterialId, TagValue, UserId } from "@/entities/value-object";

export interface FindRoleplayMaterialsParams {
  readonly state?: MaterialState;
  readonly tagNormalizedNames?: ReadonlyArray<string>;
  readonly page?: number;
  readonly limit?: number;
}

export interface CreateRoleplayMaterialLineInput {
  readonly order: number;
  readonly speakerOrder: 1 | 2;
  readonly text: string;
}

export interface CreateRoleplayMaterialInput {
  readonly ownerId: UserId;
  readonly title: string;
  readonly situation: string;
  readonly speakerOneName: string;
  readonly speakerTwoName: string;
  readonly tags: ReadonlyArray<TagValue>;
  readonly lines: ReadonlyArray<CreateRoleplayMaterialLineInput>;
}

export interface RoleplayMaterialRepositoryPort {
  findById(id: MaterialId): Promise<RoleplayMaterial | null>;
  findMany(params?: FindRoleplayMaterialsParams): Promise<RoleplayMaterial[]>;
  countActive(): Promise<number>;
  count(params?: FindRoleplayMaterialsParams): Promise<number>;
  findDistinctTags(state?: MaterialState): Promise<TagValue[]>;
  create(input: CreateRoleplayMaterialInput): Promise<RoleplayMaterial>;
}
