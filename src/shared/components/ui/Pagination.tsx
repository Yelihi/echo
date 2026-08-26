"use client";

import type { HTMLAttributes } from "react";

// shared
import {
  Pagination as PaginationNav,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/shared/components/atomics/pagination/Pagination";
import { usePagination } from "@/shared/hooks/usePagination";
import { cn } from "@/shared/lib/tailwind/utils";

export interface PaginationProps extends HTMLAttributes<HTMLElement> {
  page: number;
  totalPages: number;
}

export function Pagination({ page, totalPages, className, ...props }: PaginationProps) {
  const { current, items, hrefForPage, isPrevDisabled, isNextDisabled, isHidden } = usePagination({
    page,
    totalPages,
  });

  if (isHidden) {
    return null;
  }

  const previousPage = current - 1;
  const nextPage = current + 1;

  return (
    <PaginationNav className={className} {...props}>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious href={hrefForPage(previousPage)} disabled={isPrevDisabled} />
        </PaginationItem>
        {items.map((item, index) =>
          item === "ellipsis" ? (
            <PaginationItem key={`ellipsis-${index}`}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={item}>
              <PaginationLink href={hrefForPage(item)} isActive={item === current}>
                {item}
              </PaginationLink>
            </PaginationItem>
          ),
        )}
        <PaginationItem>
          <PaginationNext href={hrefForPage(nextPage)} disabled={isNextDisabled} />
        </PaginationItem>
      </PaginationContent>
    </PaginationNav>
  );
}

export function PaginationSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn("mx-auto flex w-full items-center justify-center gap-0.5", className)}
      aria-hidden
    >
      {Array.from({ length: 5 }, (_, index) => (
        <div
          key={index}
          className="size-8 shrink-0 animate-pulse rounded-lg border border-card-line-strong bg-white"
        />
      ))}
    </div>
  );
}
