import { InnerMenuActionStrategy, InnerMenuActionStrategyRegistry } from "@/widgets/source-card";

interface RolePlayCardActionParams {
  onNavigatePatch: (id: string) => void;
  onDelete: (id: string) => void;
}

class EditRolePlayCardActionStrategy extends InnerMenuActionStrategy {
  constructor(private readonly onNavigatePatch: (id: string) => void) {
    super();
  }

  execute(id: string): void {
    this.onNavigatePatch(id);
  }
}

class DeleteRolePlayCardActionStrategy extends InnerMenuActionStrategy {
  constructor(private readonly onDelete: (id: string) => void) {
    super();
  }

  execute(id: string): void {
    this.onDelete(id);
  }
}

export class RolePlayCardActionStrategyRegistry extends InnerMenuActionStrategyRegistry {
  protected strategies: Record<string, InnerMenuActionStrategy>;

  constructor({ onNavigatePatch, onDelete }: RolePlayCardActionParams) {
    super();
    this.strategies = {
      edit: new EditRolePlayCardActionStrategy(onNavigatePatch),
      delete: new DeleteRolePlayCardActionStrategy(onDelete),
    };
  }
}
