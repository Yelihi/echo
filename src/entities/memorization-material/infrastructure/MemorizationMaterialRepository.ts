import type { SupabaseClient } from "@supabase/supabase-js";

// shared
import type { Database } from "@/shared/lib/supabase";

// entities
import type { MemorizationMaterial } from "@/entities/memorization-material/models/entity";
import { MaterialState } from "@/entities/memorization-material/models/enums";
import {
  mapMemorizationMaterialRowToEntity,
  type MemorizationMaterialParagraphRow,
  type MemorizationMaterialSentenceRow,
  type MemorizationMaterialTagRow,
} from "@/entities/memorization-material/models/mapper";
import type {
  CreateMemorizationMaterialInput,
  FindMemorizationMaterialsParams,
  MemorizationMaterialRepositoryPort,
} from "@/entities/memorization-material/models/repository";
import type { MaterialId, TagValue } from "@/entities/value-object";

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
    const materialIds =
      params.tagNormalizedNames && params.tagNormalizedNames.length > 0
        ? await this.findMaterialIdsByTags(params.tagNormalizedNames)
        : null;

    if (materialIds && materialIds.length === 0) {
      return [];
    }

    let query = this.supabase
      .from("memorization_materials")
      .select("*")
      .eq("status", params.state ?? MaterialState.ACTIVE)
      .order("updated_at", { ascending: false })
      .order("id", { ascending: false });

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

  async countActive(): Promise<number> {
    return this.count({ state: MaterialState.ACTIVE });
  }

  async count(params: FindMemorizationMaterialsParams = {}): Promise<number> {
    const materialIds =
      params.tagNormalizedNames && params.tagNormalizedNames.length > 0
        ? await this.findMaterialIdsByTags(params.tagNormalizedNames)
        : null;

    if (materialIds && materialIds.length === 0) {
      return 0;
    }

    let query = this.supabase
      .from("memorization_materials")
      .select("id", { count: "exact", head: true })
      .eq("status", params.state ?? MaterialState.ACTIVE);

    if (materialIds) {
      query = query.in("id", materialIds);
    }

    const { count, error } = await query;

    if (error) {
      throw new Error(`Failed to count memorization materials: ${error.message}`);
    }

    return count ?? 0;
  }

  async findDistinctTags(state: MaterialState = MaterialState.ACTIVE): Promise<TagValue[]> {
    const { data: materials, error: materialsError } = await this.supabase
      .from("memorization_materials")
      .select("id")
      .eq("status", state);

    if (materialsError) {
      throw new Error(`Failed to fetch memorization materials: ${materialsError.message}`);
    }

    if (!materials.length) {
      return [];
    }

    const { data: tags, error: tagsError } = await this.supabase
      .from("memorization_material_tags")
      .select("display_name, normalized_name")
      .in(
        "material_id",
        materials.map((material) => material.id),
      );

    if (tagsError) {
      throw new Error(`Failed to fetch memorization material tags: ${tagsError.message}`);
    }

    return uniqueTagValues(tags);
  }

  async create(input: CreateMemorizationMaterialInput): Promise<MemorizationMaterial> {
    const { data: material, error: materialError } = await this.supabase
      .from("memorization_materials")
      .insert({
        user_id: input.ownerId,
        title: input.title,
      })
      .select("*")
      .single();

    if (materialError || !material) {
      throw new Error(`Failed to create memorization material: ${materialError?.message}`);
    }

    try {
      const [tagsResult, paragraphsResult] = await Promise.all([
        input.tags.length === 0
          ? Promise.resolve({ data: [] as MemorizationMaterialTagRow[], error: null })
          : this.supabase
              .from("memorization_material_tags")
              .insert(
                input.tags.map((tag) => ({
                  material_id: material.id,
                  user_id: input.ownerId,
                  display_name: tag.displayName,
                  normalized_name: tag.normalizedName,
                })),
              )
              .select("*"),
        this.supabase
          .from("memorization_material_paragraphs")
          .insert(
            input.paragraphs.map((paragraph) => ({
              material_id: material.id,
              user_id: input.ownerId,
              paragraph_order: paragraph.order,
            })),
          )
          .select("*"),
      ]);

      if (tagsResult.error) {
        throw new Error(`Failed to create memorization material tags: ${tagsResult.error.message}`);
      }

      const { data: paragraphs, error: paragraphsError } = paragraphsResult;

      if (paragraphsError || !paragraphs) {
        throw new Error(
          `Failed to create memorization material paragraphs: ${paragraphsError?.message}`,
        );
      }

      const paragraphIdByOrder = new Map(
        paragraphs.map((paragraph) => [paragraph.paragraph_order, paragraph.id] as const),
      );

      const { data: sentences, error: sentencesError } = await this.supabase
        .from("memorization_material_sentences")
        .insert(
          input.paragraphs.flatMap((paragraph) => {
            const paragraphId = paragraphIdByOrder.get(paragraph.order);

            if (!paragraphId) {
              throw new Error(
                `Failed to create memorization material paragraphs: missing paragraph ${paragraph.order}`,
              );
            }

            return paragraph.sentences.map((sentence) => ({
              paragraph_id: paragraphId,
              material_id: material.id,
              user_id: input.ownerId,
              sentence_order: sentence.order,
              text: sentence.text,
              translation: sentence.translation ?? null,
            }));
          }),
        )
        .select("*");

      if (sentencesError || !sentences) {
        throw new Error(
          `Failed to create memorization material sentences: ${sentencesError?.message}`,
        );
      }

      return mapMemorizationMaterialRowToEntity({
        material,
        tags: tagsResult.data ?? [],
        paragraphs,
        sentences,
      });
    } catch (error) {
      await this.supabase.from("memorization_materials").delete().eq("id", material.id);
      throw error;
    }
  }

  private async findMaterialIdsByTags(
    normalizedNames: ReadonlyArray<string>,
  ): Promise<MaterialId[]> {
    const { data, error } = await this.supabase
      .from("memorization_material_tags")
      .select("material_id")
      .in("normalized_name", [...normalizedNames]);

    if (error) {
      throw new Error(`Failed to fetch memorization material tags: ${error.message}`);
    }

    return [...new Set(data.map((row) => row.material_id as MaterialId))];
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

function uniqueTagValues(
  tags: ReadonlyArray<Pick<MemorizationMaterialTagRow, "display_name" | "normalized_name">>,
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
