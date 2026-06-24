import type { MaterialId } from "@/entities/value-object";

import type { MemorizationMaterial } from "@/entities/memorization-material/models/entity";
import type { MaterialState } from "@/entities/memorization-material/models/enums";

export interface FindMemorizationMaterialsParams {
  readonly state?: MaterialState;
  readonly tagNormalizedName?: string;
  readonly limit?: number;
}

export interface MemorizationMaterialRepositoryPort {
  findById(id: MaterialId): Promise<MemorizationMaterial | null>;
  findMany(params?: FindMemorizationMaterialsParams): Promise<MemorizationMaterial[]>;
}
