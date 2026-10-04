import { beforeEach, describe, expect, it, jest } from "@jest/globals";

jest.mock("@/shared/lib/supabase/server", () => ({ createSupabaseServerClient: jest.fn() }));
jest.mock("next/cache", () => ({ revalidatePath: jest.fn() }));
jest.mock("@/entities/roleplay-material", () => ({
  ...jest.requireActual<object>("@/entities/roleplay-material"),
  createRoleplayMaterialRepository: jest.fn(),
}));
jest.mock("@/entities/memorization-material", () => ({
  ...jest.requireActual<object>("@/entities/memorization-material"),
  createMemorizationMaterialRepository: jest.fn(),
}));

let revalidatePath: typeof import("next/cache").revalidatePath;

const id = "11111111-1111-4111-8111-111111111111";
const update = jest.fn<() => Promise<void>>();
const create = jest.fn();
const softDelete = jest.fn<() => Promise<void>>();
const getUser = jest.fn();

beforeEach(async () => {
  jest.clearAllMocks();
  revalidatePath = (await import("next/cache")).revalidatePath;
  update.mockResolvedValue(undefined);
  softDelete.mockResolvedValue(undefined);
  getUser.mockReturnValue({ data: { user: { id } } });
  const { createSupabaseServerClient } = await import("@/shared/lib/supabase/server");
  jest.mocked(createSupabaseServerClient).mockResolvedValue({ auth: { getUser } } as never);
  const { createRoleplayMaterialRepository } = await import("@/entities/roleplay-material");
  const { createMemorizationMaterialRepository } = await import("@/entities/memorization-material");
  jest
    .mocked(createRoleplayMaterialRepository)
    .mockReturnValue({ update, create, softDelete } as never);
  jest
    .mocked(createMemorizationMaterialRepository)
    .mockReturnValue({ update, create, softDelete } as never);
});

for (const mode of ["roleplay", "memorization"] as const) {
  describe(`${mode} edit action`, () => {
    const save = async (materialId?: string) => {
      if (mode === "roleplay") {
        const { saveRolePlayMaterial } = await import("../saveRolePlayMaterial");
        return saveRolePlayMaterial(
          {
            title: "Title",
            situation: "Test",
            tags: [],
            lines: [{ id, speaker: "me", text: "Hello." }],
          },
          materialId,
        );
      }
      const { saveMemorizationMaterial } =
        await import("@/views/memorization/services/action/saveMemorizationMaterial");
      return saveMemorizationMaterial(
        { title: "Title", tags: [], rawText: "Hello.", paragraphs: ["Hello."], confirmed: true },
        materialId,
      );
    };
    it("updates the same ID without creating another material", async () => {
      expect(await save(id)).toEqual({ code: "SUCCESS", materialId: id });
      expect(update).toHaveBeenCalledWith(id, expect.objectContaining({ ownerId: id }));
      expect(create).not.toHaveBeenCalled();
      expect(revalidatePath).toHaveBeenCalledWith("/my-page");
    });
    it("rejects invalid IDs before persistence", async () => {
      expect((await save("invalid")).code).not.toBe("SUCCESS");
      expect(revalidatePath).not.toHaveBeenCalled();
      expect(update).not.toHaveBeenCalled();
      expect(create).not.toHaveBeenCalled();
    });
    it("does not report an unsuccessful update as saved", async () => {
      update.mockRejectedValue(new Error("DB unavailable"));
      expect((await save(id)).code).not.toBe("SUCCESS");
      expect(revalidatePath).not.toHaveBeenCalled();
      expect(create).not.toHaveBeenCalled();
    });
    it("refreshes the activity page after creating a material", async () => {
      create.mockReturnValue({ id });
      expect(await save()).toEqual({ code: "SUCCESS", materialId: id });
      expect(revalidatePath).toHaveBeenCalledWith("/my-page");
    });
    it("requires authentication", async () => {
      getUser.mockReturnValue({ data: { user: null } });
      expect((await save(id)).code).not.toBe("SUCCESS");
      expect(update).not.toHaveBeenCalled();
    });
  });
}

for (const mode of ["roleplay", "memorization"] as const) {
  describe(`${mode} delete action refresh`, () => {
    const remove = async () =>
      mode === "roleplay"
        ? (await import("../deleteRolePlayMaterial")).deleteRolePlayMaterial(id)
        : (
            await import("@/views/memorization/services/action/deleteMemorizationMaterial")
          ).deleteMemorizationMaterial(id);
    it("refreshes the activity page only after a successful deletion", async () => {
      expect(await remove()).toBe(true);
      expect(revalidatePath).toHaveBeenCalledWith("/my-page");
    });
    it("preserves cached activity when deletion fails", async () => {
      softDelete.mockRejectedValue(new Error("DB unavailable"));
      expect(await remove()).toBe(false);
      expect(revalidatePath).not.toHaveBeenCalled();
    });
    it("does not delete or refresh for an unauthenticated request", async () => {
      getUser.mockReturnValue({ data: { user: null } });
      expect(await remove()).toBe(false);
      expect(softDelete).not.toHaveBeenCalled();
      expect(revalidatePath).not.toHaveBeenCalled();
    });
  });
}
