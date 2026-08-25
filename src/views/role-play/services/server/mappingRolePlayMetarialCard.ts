// shared
import { createSupabaseServerClient } from "@/shared/lib/supabase/server";

// entities
import { createRoleplayMaterialRepository } from "@/entities/roleplay-material";

// views
import { ROLE_PLAY_LIST_PAGE_SIZE } from "@/views/role-play/config/const";
import { convertRolePlaySessionCard } from "@/views/role-play/models/converter/convertRolePlaySessionCard";
import type {
  GetRolePlaySessionsParams,
  RolePlayMaterialListResult,
} from "@/views/role-play/models/interface";

export const mappingRolePlayMetarialCard = async ({
  page = 1,
  limit = ROLE_PLAY_LIST_PAGE_SIZE,
  tags,
}: GetRolePlaySessionsParams): Promise<RolePlayMaterialListResult> => {
  const supabase = await createSupabaseServerClient();
  const roleplayMaterialRepository = createRoleplayMaterialRepository(supabase);
  const [roleplayMaterials, totalCount] = await Promise.all([
    roleplayMaterialRepository.findMany({
      page,
      limit,
      tagNormalizedNames: tags,
    }),
    roleplayMaterialRepository.count({
      tagNormalizedNames: tags,
    }),
  ]);

  return {
    cards: roleplayMaterials.map((material) => convertRolePlaySessionCard(material, "blue")),
    page,
    totalCount,
    totalPages: totalCount === 0 ? 0 : Math.ceil(totalCount / limit),
  };
};
