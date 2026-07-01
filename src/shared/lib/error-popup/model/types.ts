export interface ErrorPopupViewModel {
  readonly title: string;
  readonly message: string;
  readonly code?: string;
}

export interface ErrorPopupStoreState {
  readonly popup: ErrorPopupViewModel | null;
  readonly open: (popup: ErrorPopupViewModel) => void;
  readonly close: () => void;
}
