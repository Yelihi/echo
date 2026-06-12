import type { UserId } from "@/shared/domain/value-objects";

export interface EchoUserProfile {
  readonly id: UserId;
  readonly displayName: string | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}
