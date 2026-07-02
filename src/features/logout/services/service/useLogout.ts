"use client";

import { useState } from "react";

import { errorPopupManager } from "@/shared/lib/error-popup";

import { useLogoutSupabaseInClient } from "@/features/logout/services/query/useLogoutSupabaseInClient";

export const useLogout = () => {
  const [isPending, setIsPending] = useState(false);
  const { handleLogout } = useLogoutSupabaseInClient();

  const requestLogout = async () => {
    setIsPending(true);

    const response = await handleLogout();

    if (response.error) {
      errorPopupManager.open({
        title: "로그아웃 실패",
        message: "잠시 후 다시 시도해 주세요.",
        code: "AUTH-001",
      });
    }

    setIsPending(false);
  };

  return {
    isPending,
    requestLogout,
  };
};
