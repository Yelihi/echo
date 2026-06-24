import type { SupabaseClient } from "@supabase/supabase-js";

import type { MaterialId } from "@/entities/value-object";
import type { Database } from "@/shared/lib/supabase";
import type { RoleplayMaterial } from "@/entities/roleplay-material/models/entity";
import { MaterialState } from "@/entities/roleplay-material/models/enums";
import {
  mapRoleplayMaterialRowToEntity,
  type RoleplayLineRow,
  type RoleplayMaterialTagRow,
} from "@/entities/roleplay-material/models/mapper";
import type {
  FindRoleplayMaterialsParams,
  RoleplayMaterialRepositoryPort,
} from "@/entities/roleplay-material/models/repository";

export class RoleplayMaterialRepository implements RoleplayMaterialRepositoryPort {
  constructor(private readonly supabase: SupabaseClient<Database>) {}

  async findById(id: MaterialId): Promise<RoleplayMaterial | null> {
    const { data: material, error } = await this.supabase
      .from("roleplay_materials")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to fetch roleplay material: ${error.message}`);
    }

    if (!material) {
      return null;
    }

    const [tags, lines] = await Promise.all([
      this.findTagsByMaterialId(material.id as MaterialId),
      this.findLinesByMaterialId(material.id as MaterialId),
    ]);

    return mapRoleplayMaterialRowToEntity({ material, tags, lines });
  }

  async findMany(params: FindRoleplayMaterialsParams = {}): Promise<RoleplayMaterial[]> {
    const materialIds = params.tagNormalizedName
      ? await this.findMaterialIdsByTag(params.tagNormalizedName)
      : null;

    if (materialIds && materialIds.length === 0) {
      return [];
    }

    let query = this.supabase
      .from("roleplay_materials")
      .select("*")
      .eq("status", params.state ?? MaterialState.ACTIVE)
      .order("updated_at", { ascending: false });

    if (materialIds) {
      query = query.in("id", materialIds);
    }

    if (params.limit) {
      query = query.limit(params.limit);
    }

    const { data: materials, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch roleplay materials: ${error.message}`);
    }

    if (!materials.length) {
      return [];
    }

    const ids = materials.map((material) => material.id as MaterialId);
    const [tags, lines] = await Promise.all([
      this.findTagsByMaterialIds(ids),
      this.findLinesByMaterialIds(ids),
    ]);

    return materials.map((material) =>
      mapRoleplayMaterialRowToEntity({
        material,
        tags: tags.filter((tag) => tag.material_id === material.id),
        lines: lines.filter((line) => line.material_id === material.id),
      }),
    );
  }

  private async findMaterialIdsByTag(normalizedName: string): Promise<MaterialId[]> {
    const { data, error } = await this.supabase
      .from("roleplay_material_tags")
      .select("material_id")
      .eq("normalized_name", normalizedName);

    if (error) {
      throw new Error(`Failed to fetch roleplay material tags: ${error.message}`);
    }

    return data.map((row) => row.material_id as MaterialId);
  }

  private async findTagsByMaterialId(materialId: MaterialId): Promise<RoleplayMaterialTagRow[]> {
    const { data, error } = await this.supabase
      .from("roleplay_material_tags")
      .select("*")
      .eq("material_id", materialId);

    if (error) {
      throw new Error(`Failed to fetch roleplay material tags: ${error.message}`);
    }

    return data;
  }

  private async findLinesByMaterialId(materialId: MaterialId): Promise<RoleplayLineRow[]> {
    const { data, error } = await this.supabase
      .from("roleplay_lines")
      .select("*")
      .eq("material_id", materialId);

    if (error) {
      throw new Error(`Failed to fetch roleplay lines: ${error.message}`);
    }

    return data;
  }

  private async findTagsByMaterialIds(
    materialIds: ReadonlyArray<MaterialId>,
  ): Promise<RoleplayMaterialTagRow[]> {
    const { data, error } = await this.supabase
      .from("roleplay_material_tags")
      .select("*")
      .in("material_id", [...materialIds]);

    if (error) {
      throw new Error(`Failed to fetch roleplay material tags: ${error.message}`);
    }

    return data;
  }

  private async findLinesByMaterialIds(
    materialIds: ReadonlyArray<MaterialId>,
  ): Promise<RoleplayLineRow[]> {
    const { data, error } = await this.supabase
      .from("roleplay_lines")
      .select("*")
      .in("material_id", [...materialIds]);

    if (error) {
      throw new Error(`Failed to fetch roleplay lines: ${error.message}`);
    }

    return data;
  }
}

export function createRoleplayMaterialRepository(
  supabase: SupabaseClient<Database>,
): RoleplayMaterialRepositoryPort {
  return new RoleplayMaterialRepository(supabase);
}
