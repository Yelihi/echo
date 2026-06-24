import type { SupabaseClient } from "@supabase/supabase-js";

import type { MaterialId } from "@/entities/value-object";
import type { Database } from "@/shared/lib/supabase";
import type { MemorizationMaterial } from "@/entities/memorization-material/models/entity";
import { MaterialState } from "@/entities/memorization-material/models/enums";
import {
  mapMemorizationMaterialRowToEntity,
  type MemorizationMaterialParagraphRow,
  type MemorizationMaterialSentenceRow,
  type MemorizationMaterialTagRow,
} from "@/entities/memorization-material/models/mapper";
import type {
  FindMemorizationMaterialsParams,
  MemorizationMaterialRepositoryPort,
} from "@/entities/memorization-material/models/repository";

export class MemorizationMaterialRepository implements MemorizationMaterialRepositoryPort {
  constructor(private readonly supabase: SupabaseClient<Database>) {}

  async findById(id: MaterialId): Promise<MemorizationMaterial | null> {
    const { data: material, error } = await this.supabase
      .from("memorization_materials")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to fetch memorization material: ${error.message}`);
    }

    if (!material) {
      return null;
    }

    const [tags, paragraphs, sentences] = await Promise.all([
      this.findTagsByMaterialId(material.id as MaterialId),
      this.findParagraphsByMaterialId(material.id as MaterialId),
      this.findSentencesByMaterialId(material.id as MaterialId),
    ]);

    return mapMemorizationMaterialRowToEntity({ material, tags, paragraphs, sentences });
  }

  async findMany(params: FindMemorizationMaterialsParams = {}): Promise<MemorizationMaterial[]> {
    const materialIds = params.tagNormalizedName
      ? await this.findMaterialIdsByTag(params.tagNormalizedName)
      : null;

    if (materialIds && materialIds.length === 0) {
      return [];
    }

    let query = this.supabase
      .from("memorization_materials")
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
      throw new Error(`Failed to fetch memorization materials: ${error.message}`);
    }

    if (!materials.length) {
      return [];
    }

    const ids = materials.map((material) => material.id as MaterialId);
    const [tags, paragraphs, sentences] = await Promise.all([
      this.findTagsByMaterialIds(ids),
      this.findParagraphsByMaterialIds(ids),
      this.findSentencesByMaterialIds(ids),
    ]);

    return materials.map((material) =>
      mapMemorizationMaterialRowToEntity({
        material,
        tags: tags.filter((tag) => tag.material_id === material.id),
        paragraphs: paragraphs.filter((paragraph) => paragraph.material_id === material.id),
        sentences: sentences.filter((sentence) => sentence.material_id === material.id),
      }),
    );
  }

  private async findMaterialIdsByTag(normalizedName: string): Promise<MaterialId[]> {
    const { data, error } = await this.supabase
      .from("memorization_material_tags")
      .select("material_id")
      .eq("normalized_name", normalizedName);

    if (error) {
      throw new Error(`Failed to fetch memorization material tags: ${error.message}`);
    }

    return data.map((row) => row.material_id as MaterialId);
  }

  private async findTagsByMaterialId(
    materialId: MaterialId,
  ): Promise<MemorizationMaterialTagRow[]> {
    const { data, error } = await this.supabase
      .from("memorization_material_tags")
      .select("*")
      .eq("material_id", materialId);

    if (error) {
      throw new Error(`Failed to fetch memorization material tags: ${error.message}`);
    }

    return data;
  }

  private async findParagraphsByMaterialId(
    materialId: MaterialId,
  ): Promise<MemorizationMaterialParagraphRow[]> {
    const { data, error } = await this.supabase
      .from("memorization_material_paragraphs")
      .select("*")
      .eq("material_id", materialId);

    if (error) {
      throw new Error(`Failed to fetch memorization material paragraphs: ${error.message}`);
    }

    return data;
  }

  private async findSentencesByMaterialId(
    materialId: MaterialId,
  ): Promise<MemorizationMaterialSentenceRow[]> {
    const { data, error } = await this.supabase
      .from("memorization_material_sentences")
      .select("*")
      .eq("material_id", materialId);

    if (error) {
      throw new Error(`Failed to fetch memorization material sentences: ${error.message}`);
    }

    return data;
  }

  private async findTagsByMaterialIds(
    materialIds: ReadonlyArray<MaterialId>,
  ): Promise<MemorizationMaterialTagRow[]> {
    const { data, error } = await this.supabase
      .from("memorization_material_tags")
      .select("*")
      .in("material_id", [...materialIds]);

    if (error) {
      throw new Error(`Failed to fetch memorization material tags: ${error.message}`);
    }

    return data;
  }

  private async findParagraphsByMaterialIds(
    materialIds: ReadonlyArray<MaterialId>,
  ): Promise<MemorizationMaterialParagraphRow[]> {
    const { data, error } = await this.supabase
      .from("memorization_material_paragraphs")
      .select("*")
      .in("material_id", [...materialIds]);

    if (error) {
      throw new Error(`Failed to fetch memorization material paragraphs: ${error.message}`);
    }

    return data;
  }

  private async findSentencesByMaterialIds(
    materialIds: ReadonlyArray<MaterialId>,
  ): Promise<MemorizationMaterialSentenceRow[]> {
    const { data, error } = await this.supabase
      .from("memorization_material_sentences")
      .select("*")
      .in("material_id", [...materialIds]);

    if (error) {
      throw new Error(`Failed to fetch memorization material sentences: ${error.message}`);
    }

    return data;
  }
}

export function createMemorizationMaterialRepository(
  supabase: SupabaseClient<Database>,
): MemorizationMaterialRepositoryPort {
  return new MemorizationMaterialRepository(supabase);
}
