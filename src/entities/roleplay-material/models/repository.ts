import type { MaterialId } from "@/entities/value-object";

import type { RoleplayMaterial } from "@/entities/roleplay-material/models/entity";
import type { MaterialState } from "@/entities/roleplay-material/models/enums";

export interface FindRoleplayMaterialsParams {
  readonly state?: MaterialState;
  readonly tagNormalizedName?: string;
  readonly limit?: number;
}

export interface RoleplayMaterialRepositoryPort {
  findById(id: MaterialId): Promise<RoleplayMaterial | null>;
  findMany(params?: FindRoleplayMaterialsParams): Promise<RoleplayMaterial[]>;
}
