import type { CleanupFailureSource } from "@/entities/cleanup-failure-log";
import type {
  CleanupFailureLogRepositoryPort,
  CreateCleanupFailureLogInput,
} from "@/entities/cleanup-failure-log/models/repository";
export interface RecordCleanupFailureInput extends CreateCleanupFailureLogInput {
  readonly repository?: CleanupFailureLogRepositoryPort;
}

export type CreateCleanupFailureInput = Omit<
  CreateCleanupFailureLogInput,
  "source" | "errorMessage"
> & {
  readonly source: CleanupFailureSource;
  readonly error: unknown;
  readonly repository?: CleanupFailureLogRepositoryPort;
};
