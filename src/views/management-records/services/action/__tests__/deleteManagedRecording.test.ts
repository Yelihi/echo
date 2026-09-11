import { describe, expect, it, jest, beforeEach } from "@jest/globals";

jest.mock("server-only", () => ({}));
jest.mock("next/cache", () => ({ revalidatePath: jest.fn() }));
jest.mock("@/shared/lib/supabase/server", () => ({ createSupabaseServerClient: jest.fn() }));
jest.mock("@/shared/lib/supabase/service-role", () => ({
  getSupabaseServiceRoleClient: jest.fn(),
}));
jest.mock("@/shared/lib/recording-storage/server", () => ({ RecordingStorageService: jest.fn() }));
jest.mock("@/features/recording-storage/services/server", () => ({
  deleteUnacceptedDraftRecording: jest.fn(),
}));

const id = "11111111-1111-4111-8111-111111111111";

describe("deleteManagedRecording", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("rejects invalid IDs and unauthenticated requests before deletion", async () => {
    const { getSupabaseServiceRoleClient } = await import("@/shared/lib/supabase/service-role");
    const { createSupabaseServerClient } = await import("@/shared/lib/supabase/server");
    const { deleteUnacceptedDraftRecording } =
      await import("@/features/recording-storage/services/server");
    const { deleteManagedRecording } = await import("../deleteManagedRecording");
    expect(await deleteManagedRecording("bad-id")).toEqual({ code: "INVALID_INPUT" });
    expect(createSupabaseServerClient).not.toHaveBeenCalled();
    jest.mocked(createSupabaseServerClient).mockImplementation(
      async () =>
        ({
          auth: { getUser: async () => ({ data: { user: null } }) },
        }) as Awaited<ReturnType<typeof createSupabaseServerClient>>,
    );
    expect(await deleteManagedRecording(id)).toEqual({ code: "UNAUTHORIZED" });
    expect(deleteUnacceptedDraftRecording).not.toHaveBeenCalled();
    expect(getSupabaseServiceRoleClient).not.toHaveBeenCalled();
  });

  it("routes deletion through the owner/accepted-protected workflow and refreshes failures", async () => {
    const { getSupabaseServiceRoleClient } = await import("@/shared/lib/supabase/service-role");
    const { RecordingStorageService } = await import("@/shared/lib/recording-storage/server");
    const privilegedClient = {} as ReturnType<typeof getSupabaseServiceRoleClient>;
    jest.mocked(getSupabaseServiceRoleClient).mockReturnValue(privilegedClient);
    const { revalidatePath } = await import("next/cache");
    const { createSupabaseServerClient } = await import("@/shared/lib/supabase/server");
    const { deleteUnacceptedDraftRecording } =
      await import("@/features/recording-storage/services/server");
    const { deleteManagedRecording } = await import("../deleteManagedRecording");
    jest.mocked(createSupabaseServerClient).mockImplementation(
      async () =>
        ({
          auth: { getUser: async () => ({ data: { user: { id: "owner" } } }) },
        }) as Awaited<ReturnType<typeof createSupabaseServerClient>>,
    );
    jest.mocked(deleteUnacceptedDraftRecording).mockRejectedValueOnce(new Error("storage failed"));
    expect(await deleteManagedRecording(id)).toEqual({ code: "DELETE_FAILED" });
    expect(RecordingStorageService).toHaveBeenCalledWith(privilegedClient);
    expect(deleteUnacceptedDraftRecording).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "owner",
        draftRecordingId: id,
        cleanupFailureLogRepository: expect.anything(),
      }),
    );
    expect(revalidatePath).toHaveBeenCalledWith("/recording-management");
    jest.mocked(deleteUnacceptedDraftRecording).mockResolvedValueOnce(undefined);
    expect(await deleteManagedRecording(id)).toEqual({ code: "SUCCESS" });
  });
});
