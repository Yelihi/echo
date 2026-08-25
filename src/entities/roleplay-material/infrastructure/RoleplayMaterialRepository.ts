import type { SupabaseClient } from "@supabase/supabase-js";

// shared
import type { Database } from "@/shared/lib/supabase";

// entities
import type { RoleplayMaterial } from "@/entities/roleplay-material/models/entity";
import { MaterialState } from "@/entities/roleplay-material/models/enums";
import {
  mapRoleplayMaterialRowToEntity,
  type RoleplayLineRow,
  type RoleplayMaterialTagRow,
} from "@/entities/roleplay-material/models/mapper";
import type {
  CreateRoleplayMaterialInput,
  FindRoleplayMaterialsParams,
  RoleplayMaterialRepositoryPort,
} from "@/entities/roleplay-material/models/repository";
import type { MaterialId, TagValue } from "@/entities/value-object";

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
    const materialIds =
      params.tagNormalizedNames && params.tagNormalizedNames.length > 0
        ? await this.findMaterialIdsByTags(params.tagNormalizedNames)
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
      if (params.page != null) {
        const page = Math.max(1, params.page);
        const from = (page - 1) * params.limit;
        query = query.range(from, from + params.limit - 1);
      } else {
        query = query.limit(params.limit);
      }
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

  async countActive(): Promise<number> {
    return this.count({ state: MaterialState.ACTIVE });
  }

  async count(params: FindRoleplayMaterialsParams = {}): Promise<number> {
    const materialIds =
      params.tagNormalizedNames && params.tagNormalizedNames.length > 0
        ? await this.findMaterialIdsByTags(params.tagNormalizedNames)
        : null;

    if (materialIds && materialIds.length === 0) {
      return 0;
    }

    let query = this.supabase
      .from("roleplay_materials")
      .select("id", { count: "exact", head: true })
      .eq("status", params.state ?? MaterialState.ACTIVE);

    if (materialIds) {
      query = query.in("id", materialIds);
    }

    const { count, error } = await query;

    if (error) {
      throw new Error(`Failed to count roleplay materials: ${error.message}`);
    }

    return count ?? 0;
  }

  async findDistinctTags(state: MaterialState = MaterialState.ACTIVE): Promise<TagValue[]> {
    const { data: materials, error: materialsError } = await this.supabase
      .from("roleplay_materials")
      .select("id")
      .eq("status", state);

    if (materialsError) {
      throw new Error(`Failed to fetch roleplay materials: ${materialsError.message}`);
    }

    if (!materials.length) {
      return [];
    }

    const { data: tags, error: tagsError } = await this.supabase
      .from("roleplay_material_tags")
      .select("display_name, normalized_name")
      .in(
        "material_id",
        materials.map((material) => material.id),
      );

    if (tagsError) {
      throw new Error(`Failed to fetch roleplay material tags: ${tagsError.message}`);
    }

    return uniqueTagValues(tags);
  }

  async create(input: CreateRoleplayMaterialInput): Promise<RoleplayMaterial> {
    const { data: material, error: materialError } = await this.supabase
      .from("roleplay_materials")
      .insert({
        user_id: input.ownerId,
        title: input.title,
        situation: input.situation,
        speaker_one_name: input.speakerOneName,
        speaker_two_name: input.speakerTwoName,
      })
      .select("*")
      .single();

    if (materialError || !material) {
      throw new Error(`Failed to create roleplay material: ${materialError?.message}`);
    }

    try {
      const tagsResult =
        input.tags.length === 0
          ? { data: [] as RoleplayMaterialTagRow[], error: null }
          : await this.supabase
              .from("roleplay_material_tags")
              .insert(
                input.tags.map((tag) => ({
                  material_id: material.id,
                  user_id: input.ownerId,
                  display_name: tag.displayName,
                  normalized_name: tag.normalizedName,
                })),
              )
              .select("*");

      if (tagsResult.error) {
        throw new Error(`Failed to create roleplay material tags: ${tagsResult.error.message}`);
      }

      const { data: lines, error: linesError } = await this.supabase
        .from("roleplay_lines")
        .insert(
          input.lines.map((line) => ({
            material_id: material.id,
            user_id: input.ownerId,
            line_order: line.order,
            speaker_order: line.speakerOrder,
            text: line.text,
            translation: null,
          })),
        )
        .select("*");

      if (linesError || !lines) {
        throw new Error(`Failed to create roleplay lines: ${linesError?.message}`);
      }

      return mapRoleplayMaterialRowToEntity({
        material,
        tags: tagsResult.data ?? [],
        lines,
      });
    } catch (error) {
      await this.supabase.from("roleplay_materials").delete().eq("id", material.id);
      throw error;
    }
  }

  private async findMaterialIdsByTags(
    normalizedNames: ReadonlyArray<string>,
  ): Promise<MaterialId[]> {
    const { data, error } = await this.supabase
      .from("roleplay_material_tags")
      .select("material_id")
      .in("normalized_name", [...normalizedNames]);

    if (error) {
      throw new Error(`Failed to fetch roleplay material tags: ${error.message}`);
    }

    return [...new Set(data.map((row) => row.material_id as MaterialId))];
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

function uniqueTagValues(
  tags: ReadonlyArray<Pick<RoleplayMaterialTagRow, "display_name" | "normalized_name">>,
): TagValue[] {
  const uniqueTags = new Map<string, TagValue>();

  tags.forEach((tag) => {
    if (!uniqueTags.has(tag.normalized_name)) {
      uniqueTags.set(tag.normalized_name, {
        displayName: tag.display_name,
        normalizedName: tag.normalized_name,
      });
    }
  });

  return [...uniqueTags.values()].sort((left, right) =>
    left.displayName.localeCompare(right.displayName, "ko"),
  );
}
