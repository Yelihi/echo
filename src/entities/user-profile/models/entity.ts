import type { UserId } from "@/entities/value-object";

export interface EchoUserProfile {
  readonly id: UserId;
  readonly displayName: string | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}
