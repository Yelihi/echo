// entities
import type { MaterialId } from "@/entities/value-object";

// views
import { convertMemorizationMaterialToEditorDraft } from "@/views/memorization/models/converter/convertMemorizationEditorDraft";
import type { MemorizationEditorDraft } from "@/views/memorization/models/editor";
import { getMemorizationMaterial } from "@/views/memorization/services/server/getMemorizationMaterial";

export async function getMemorizationEditorDraft(
  materialId: MaterialId,
): Promise<MemorizationEditorDraft | null> {
  const material = await getMemorizationMaterial(materialId);

  if (!material) {
    return null;
  }

  return convertMemorizationMaterialToEditorDraft(material);
}
