import "server-only";
import { createRoleplayMaterialRepository } from "@/entities/roleplay-material";
import { createMemorizationMaterialRepository } from "@/entities/memorization-material";
import { createSupabaseServerClient } from "@/shared/lib/supabase/server";
import type { MyPageMaterialItem } from "@/views/my-page/models/interface";

export async function getMyPageMaterials(
  type: "roleplay" | "memorization",
): Promise<MyPageMaterialItem[]> {
  const supabase = await createSupabaseServerClient();
  if (type === "roleplay") {
    const materials = await createRoleplayMaterialRepository(supabase).findMany({
      page: 1,
      limit: 2,
    });
    return materials.map((item) => ({
      id: item.id,
      title: item.title,
      description: item.situation,
      date: item.updatedAt,
      href: `/role-playing/${item.id}/ready`,
    }));
  }
  const materials = await createMemorizationMaterialRepository(supabase).findMany({
    page: 1,
    limit: 2,
  });
  return materials.map((item) => ({
    id: item.id,
    title: item.title,
    description: `${item.paragraphs.length}개 문단`,
    date: item.updatedAt,
    href: `/sentence-memorization/${item.id}/ready`,
  }));
}
