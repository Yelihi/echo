"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Toggle as TogglePrimitive } from "radix-ui";

import { cn } from "@/shared/lib/tailwind/utils";

const toggleVariants = cva(
  "group/toggle inline-flex items-center justify-center gap-1 rounded-pill bg-card-surface border border-control-line text-sm text-gray-text font-medium whitespace-nowrap transition-colors motion-reduce:transition-none outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-danger-ink aria-invalid:ring-danger-ink dark:aria-invalid:ring-danger-ink [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      theme: {
        blue: "aria-pressed:bg-brand aria-pressed:text-white data-[state=on]:bg-brand data-[state=on]:text-white hover:border-brand hover:text-brand data-[state=on]:hover:text-on-brand aria-pressed:hover:text-on-brand",
        black:
          "aria-pressed:bg-black-primary aria-pressed:text-white data-[state=on]:bg-black-primary data-[state=on]:text-white hover:border-black-primary hover:text-black-primary data-[state=on]:hover:text-on-brand aria-pressed:hover:text-on-brand",
        /**
         * SegmentedControl 전용. base 의 pill 형태(rounded-full / bg-white / border)를
         * 중화하고, 선택 시 차콜 면으로 강조합니다.
         * SegmentedControl 이 컨테이너에 bg-neutral-100 을 깔아 대비를 만듭니다.
         */
        segmented:
          "rounded-pill border-transparent bg-transparent shadow-none hover:border-transparent hover:text-black-primary data-[state=on]:bg-brand data-[state=on]:text-on-brand aria-pressed:bg-brand aria-pressed:text-on-brand data-[state=on]:hover:text-on-brand aria-pressed:hover:text-on-brand",
      },
      size: {
        default:
          "h-10 min-w-14 px-4 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        sm: "h-8 min-w-12 px-3 text-body-2 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-11 min-w-16 px-5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
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
