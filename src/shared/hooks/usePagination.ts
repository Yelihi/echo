"use client";

import { usePathname, useSearchParams } from "next/navigation";

// shared
import { createPaginationState } from "@/shared/utils/pagination";

interface UsePaginationParams {
  page: number;
  totalPages: number;
}

export function usePagination({ page, totalPages }: UsePaginationParams) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return createPaginationState({
    page,
    totalPages,
    pathname,
    search: searchParams.toString(),
  });
}
