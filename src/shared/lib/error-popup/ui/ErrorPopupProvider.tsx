"use client";

import { useErrorPopupStore } from "@/shared/lib/error-popup/model/store";
import { ErrorAlertDialog } from "@/shared/lib/error-popup/ui/ErrorAlertDialog";

export function ErrorPopupProvider() {
  const popup = useErrorPopupStore((state) => state.popup);
  const close = useErrorPopupStore((state) => state.close);

  return (
    <ErrorAlertDialog
      open={popup !== null}
      title={popup?.title ?? ""}
      message={popup?.message ?? ""}
      code={popup?.code}
      onConfirm={close}
    />
  );
}
