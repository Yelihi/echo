// shared
import { createSupabaseServerClient } from "@/shared/lib/supabase/server";

// entities
import { createMemorizationMaterialRepository } from "@/entities/memorization-material";

// views
import { MEMORIZATION_LIST_PAGE_SIZE } from "@/views/memorization/config/const";
import { convertMemorizationSessionCard } from "@/views/memorization/models/converter/convertMemorizationSessionCard";
import type {
  GetMemorizationSessionsParams,
  MemorizationMaterialListResult,
} from "@/views/memorization/models/interface";

export const mappingMemorizationMaterialCard = async ({
  page = 1,
  limit = MEMORIZATION_LIST_PAGE_SIZE,
  tags,
}: GetMemorizationSessionsParams): Promise<MemorizationMaterialListResult> => {
  const supabase = await createSupabaseServerClient();
  const memorizationMaterialRepository = createMemorizationMaterialRepository(supabase);
  const [memorizationMaterials, totalCount] = await Promise.all([
    memorizationMaterialRepository.findMany({
      page,
      limit,
      tagNormalizedNames: tags,
    }),
    memorizationMaterialRepository.count({
      tagNormalizedNames: tags,
    }),
  ]);

  return {
    cards: memorizationMaterials.map((material) =>
      convertMemorizationSessionCard(material, "black"),
    ),
    page,
    totalCount,
    totalPages: totalCount === 0 ? 0 : Math.ceil(totalCount / limit),
  };
};
