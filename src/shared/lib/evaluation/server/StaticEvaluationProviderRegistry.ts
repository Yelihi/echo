import { UnsupportedEvaluationModeError } from "@/shared/lib/evaluation/errors";
import type {
  EvaluationMode,
  EvaluationPracticeType,
  EvaluationProviderEntry,
  EvaluationProviderKey,
  EvaluationProviderRegistry,
} from "@/shared/lib/evaluation/types";

export interface StaticEvaluationProviderRegistryEntry extends EvaluationProviderKey {
  readonly entry: EvaluationProviderEntry;
}

export class StaticEvaluationProviderRegistry implements EvaluationProviderRegistry {
  private readonly entries: ReadonlyMap<string, EvaluationProviderEntry>;

  constructor(entries: ReadonlyArray<StaticEvaluationProviderRegistryEntry>) {
    this.entries = new Map(entries.map((entry) => [toRegistryKey(entry), entry.entry]));
  }

  resolve(key: EvaluationProviderKey): EvaluationProviderEntry {
    const entry = this.entries.get(toRegistryKey(key));

    if (!entry) {
      throw new UnsupportedEvaluationModeError(key.practiceType, key.mode);
    }

    return entry;
  }
}

function toRegistryKey(key: {
  readonly practiceType: EvaluationPracticeType;
  readonly mode: EvaluationMode;
}): string {
  return `${key.practiceType}:${key.mode}`;
}
