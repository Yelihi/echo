import { describe, expect, it } from "@jest/globals";

import type { UserProfileRow } from "@/entities/user-profile/models/mapper";
import { mapUserProfileRowToEntity } from "@/entities/user-profile/models/mapper";

describe("mapUserProfileRowToEntity", () => {
  it("maps a user profile row", () => {
    const row: UserProfileRow = {
      id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
      display_name: "Yeli",
      created_at: "2026-06-13T00:00:00.000Z",
      updated_at: "2026-06-13T00:10:00.000Z",
    };

    const entity = mapUserProfileRowToEntity(row);

    expect(entity).toMatchObject({
      id: row.id,
      displayName: "Yeli",
    });
    expect(entity.createdAt).toEqual(new Date(row.created_at));
    expect(entity.updatedAt).toEqual(new Date(row.updated_at));
  });
});
