import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";

import { cn } from "@/shared/utils/cn";

export interface SourceBadgeProps {
  value: string;
}
export type BadgeTheme = VariantProps<typeof badgeVariants>["theme"];

export const badgeVariants = cva(
  "group/badge inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-pill border border-transparent font-medium whitespace-nowrap transition-colors focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 aria-invalid:border-danger-ink aria-invalid:ring-danger-ink dark:aria-invalid:ring-danger-ink [&>svg]:pointer-events-none [&>svg]:size-3!",
  {
    variants: {
      theme: {
        blue: "border-card-line-strong bg-gray-background text-brand [&:is(a)]:hover:bg-silver/40",
        red: "bg-red-secondary text-danger-ink [&:is(a)]:hover:bg-red-secondary",
        green: "bg-green-secondary text-green-primary [&:is(a)]:hover:bg-green-secondary",
        yellow: "bg-yellow-secondary text-yellow-primary [&:is(a)]:hover:bg-yellow-secondary",
        black:
          "border-control-line bg-card-surface text-black-primary [&:is(a)]:hover:bg-gray-background",
      },
      size: {
        small: "h-[22px] px-2 py-0.5 text-body-2",
        medium: "h-[30px] px-3 py-1 text-body-2",
        large: "h-[35px] px-4 py-1.5 text-body-2",
      },
    },
    defaultVariants: {
      theme: "blue",
      size: "small",
    },
  },
);

export const Badge = ({
  className,
  value,
  theme,
  size,
  asChild = false,
  children,
  ...props
}: SourceBadgeProps &
  React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) => {
  const Comp = asChild ? Slot.Root : "span";

  return (
    <Comp
      data-slot="badge"
      data-variant={theme}
      data-value={value}
      className={cn(badgeVariants({ theme, size }), className)}
      {...props}
    >
      {children ?? value}
    </Comp>
  );
};
