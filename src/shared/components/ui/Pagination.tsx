"use client";

import type { ComponentProps } from "react";
import { usePathname, useSearchParams } from "next/navigation";

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
import { cn } from "@/shared/lib/tailwind/utils";
import { buildPageHref, getPaginationItems } from "@/shared/utils/pagination";

export interface PaginationProps {
  page: number;
  totalPages: number;
}

export function Pagination({
  page,
  totalPages,
  className,
  ...props
}: PaginationProps & ComponentProps<"nav">) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (totalPages < 1) {
    return null;
  }

  const current = Math.min(Math.max(page, 1), totalPages);
  const hrefForPage = (nextPage: number) =>
    buildPageHref(pathname, searchParams.toString(), nextPage);
  const items = getPaginationItems(current, totalPages);

  return (
    <PaginationNav className={className} {...props}>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious href={hrefForPage(current - 1)} disabled={current <= 1} />
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
          <PaginationNext href={hrefForPage(current + 1)} disabled={current >= totalPages} />
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
