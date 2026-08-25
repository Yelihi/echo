import * as React from "react";
import Link from "next/link";
import { ChevronLeftIcon, ChevronRightIcon, MoreHorizontalIcon } from "lucide-react";

// shared
import { Button } from "@/shared/components/atomics/button/Button";
import { cn } from "@/shared/lib/tailwind/utils";

function Pagination({ className, ...props }: React.ComponentProps<"nav">) {
  return (
    <nav
      aria-label="페이지네이션"
      data-slot="pagination"
      className={cn("mx-auto flex w-full justify-center", className)}
      {...props}
    />
  );
}

function PaginationContent({ className, ...props }: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="pagination-content"
      className={cn("flex items-center gap-0.5", className)}
      {...props}
    />
  );
}

function PaginationItem({ ...props }: React.ComponentProps<"li">) {
  return <li data-slot="pagination-item" {...props} />;
}

type PaginationLinkProps = {
  isActive?: boolean;
  disabled?: boolean;
} & Pick<React.ComponentProps<typeof Button>, "size"> &
  Omit<React.ComponentProps<typeof Link>, "href" | "size"> & {
    href?: React.ComponentProps<typeof Link>["href"];
  };

function PaginationLink({
  className,
  isActive,
  disabled,
  size = "icon",
  href,
  children,
  "aria-label": ariaLabel,
  ...props
}: PaginationLinkProps) {
  if (disabled || href == null) {
    return (
      <Button
        variant="ghost"
        size={size}
        disabled
        aria-disabled
        aria-label={ariaLabel}
        className={cn("text-gray-text-secondary", className)}
      >
        {children}
      </Button>
    );
  }

  return (
    <Button
      asChild
      variant={isActive ? "default" : "ghost"}
      size={size}
      className={cn(!isActive && "text-gray-text hover:text-black-primary", className)}
    >
      <Link
        href={href}
        aria-current={isActive ? "page" : undefined}
        aria-label={ariaLabel}
        data-slot="pagination-link"
        data-active={isActive}
        {...props}
      >
        {children}
      </Link>
    </Button>
  );
}

function PaginationPrevious({ className, ...props }: React.ComponentProps<typeof PaginationLink>) {
  return (
    <PaginationLink aria-label="이전 페이지" size="icon" className={className} {...props}>
      <ChevronLeftIcon />
    </PaginationLink>
  );
}

function PaginationNext({ className, ...props }: React.ComponentProps<typeof PaginationLink>) {
  return (
    <PaginationLink aria-label="다음 페이지" size="icon" className={className} {...props}>
      <ChevronRightIcon />
    </PaginationLink>
  );
}

function PaginationEllipsis({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      aria-hidden
      data-slot="pagination-ellipsis"
      className={cn(
        "flex size-8 items-center justify-center text-gray-text-secondary [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    >
      <MoreHorizontalIcon />
      <span className="sr-only">생략된 페이지</span>
    </span>
  );
}

export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
};
