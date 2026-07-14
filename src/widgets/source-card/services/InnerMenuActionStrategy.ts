export abstract class InnerMenuActionStrategy {
  abstract execute(id: string): void;
}

export abstract class InnerMenuActionStrategyRegistry {
  protected abstract strategies: Record<string, InnerMenuActionStrategy>;

  execute(value: string, id: string): void {
    const strategy = this.strategies[value];

    if (!strategy) {
      throw new Error(`InnerMenuActionStrategyRegistry: unsupported menu value "${value}"`);
    }

    strategy.execute(id);
  }
}
