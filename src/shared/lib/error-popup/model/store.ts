import { createStore } from "@/shared/lib/store/create-store";
import type {
  ErrorPopupStoreState,
  ErrorPopupViewModel,
} from "@/shared/lib/error-popup/model/types";

export const useErrorPopupStore = createStore<ErrorPopupStoreState>("ErrorPopupStore", (set) => ({
  popup: null,
  open: (popup: ErrorPopupViewModel) => set({ popup }),
  close: () => set({ popup: null }),
}));

export const errorPopupManager = {
  open: (popup: ErrorPopupViewModel): void => {
    useErrorPopupStore.getState().open(popup);
  },
  close: (): void => {
    useErrorPopupStore.getState().close();
  },
};
