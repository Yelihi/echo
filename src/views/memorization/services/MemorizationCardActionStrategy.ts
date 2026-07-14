import { InnerMenuActionStrategy, InnerMenuActionStrategyRegistry } from "@/widgets/source-card";

interface MemorizationCardActionParams {
  onNavigatePatch: (id: string) => void;
  onDelete: (id: string) => void;
}

class EditMemorizationCardActionStrategy extends InnerMenuActionStrategy {
  constructor(private readonly onNavigatePatch: (id: string) => void) {
    super();
  }

  execute(id: string): void {
    this.onNavigatePatch(id);
  }
}

class DeleteMemorizationCardActionStrategy extends InnerMenuActionStrategy {
  constructor(private readonly onDelete: (id: string) => void) {
    super();
  }

  execute(id: string): void {
    this.onDelete(id);
  }
}

export class MemorizationCardActionStrategyRegistry extends InnerMenuActionStrategyRegistry {
  protected strategies: Record<string, InnerMenuActionStrategy>;

  constructor({ onNavigatePatch, onDelete }: MemorizationCardActionParams) {
    super();
    this.strategies = {
      edit: new EditMemorizationCardActionStrategy(onNavigatePatch),
      delete: new DeleteMemorizationCardActionStrategy(onDelete),
    };
  }
}
