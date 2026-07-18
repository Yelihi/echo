"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Toggle as TogglePrimitive } from "radix-ui";

import { cn } from "@/shared/lib/tailwind/utils";

const toggleVariants = cva(
  "group/toggle inline-flex items-center justify-center gap-1 rounded-full bg-white border border-gray-border text-sm text-gray-text font-medium whitespace-nowrap transition-all duration-300 outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      theme: {
        blue: "aria-pressed:bg-blue-primary aria-pressed:text-white data-[state=on]:bg-blue-primary data-[state=on]:text-white hover:border-blue-primary hover:text-blue-primary",
        black:
          "aria-pressed:bg-black-primary aria-pressed:text-white data-[state=on]:bg-black-primary data-[state=on]:text-white hover:border-black-primary hover:text-black-primary",
      },
      size: {
        default:
          "h-[34px] min-w-[53px] px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        sm: "h-[29px] min-w-[46px] rounded-[min(var(--radius-md),12px)] px-2.5 text-[0.8rem] has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-[40px] min-w-[60px] px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
      },
    },
    defaultVariants: {
      theme: "blue",
      size: "default",
    },
  },
);

function Toggle({
  className,

  theme = "blue",
  size = "default",
  ...props
}: React.ComponentProps<typeof TogglePrimitive.Root> & VariantProps<typeof toggleVariants>) {
  return (
    <TogglePrimitive.Root
      data-slot="toggle"
      className={cn(toggleVariants({ theme, size, className }))}
      {...props}
    />
  );
}

export { Toggle, toggleVariants };
