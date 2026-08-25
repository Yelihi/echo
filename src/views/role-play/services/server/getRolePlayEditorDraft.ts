// entities
import type { MaterialId } from "@/entities/value-object";

// views
import { convertRolePlayMaterialToEditorDraft } from "@/views/role-play/models/converter/convertRolePlayEditorDraft";
import type { RoleplayEditorDraft } from "@/views/role-play/models/interface";
import { getRolePlayMaterial } from "@/views/role-play/services/server/getRolePlayMaterial";

export async function getRolePlayEditorDraft(
  materialId: MaterialId,
): Promise<RoleplayEditorDraft | null> {
  const material = await getRolePlayMaterial(materialId);

  if (!material) {
    return null;
  }

  return convertRolePlayMaterialToEditorDraft(material);
}
