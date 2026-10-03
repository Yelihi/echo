import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";

import { cn } from "@/shared/lib/tailwind/utils";

const buttonVariants = cva(
  "group/button inline-flex shrink-0 cursor-pointer items-center justify-center rounded-pill border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-colors motion-reduce:transition-none outline-none select-none focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2  disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-red-primary aria-invalid:ring-3 aria-invalid:ring-red-primary/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-brand text-on-brand hover:bg-brand-hover",
        outline:
          "border-control-line bg-card-surface hover:bg-gray-background hover:text-black-primary aria-expanded:bg-gray-background aria-expanded:text-black-primary",
        secondary:
          "bg-neutral-100 text-brand hover:bg-silver/40 aria-expanded:bg-gray-background aria-expanded:text-brand",
        ghost:
          "hover:bg-gray-background hover:text-brand aria-expanded:bg-gray-background aria-expanded:text-black-primary",
        destructive:
          "bg-red-secondary text-danger-ink hover:bg-red-secondary/70 focus-visible:border-danger-ink focus-visible:ring-danger-ink",
        link: "text-brand underline underline-offset-4 hover:text-brand-hover",
      },
      size: {
        default:
          "h-11 gap-2 px-5 has-data-[icon=inline-end]:pr-4 has-data-[icon=inline-start]:pl-4",
        xs: "h-7 gap-1 px-3 text-body-1 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-9 gap-1.5 px-4 text-body-2 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-12 gap-2 px-6 has-data-[icon=inline-end]:pr-5 has-data-[icon=inline-start]:pl-5",
        icon: "size-11",
        "icon-xs": "size-7 [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-9",
        "icon-lg": "size-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot.Root : "button";

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
