import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";

import { cn } from "@/shared/utils/cn";

export interface SourceBadgeProps {
  value: string;
}
export type BadgeTheme = VariantProps<typeof badgeVariants>["theme"];

export const badgeVariants = cva(
  "group/badge inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-4xl border border-transparent font-medium whitespace-nowrap transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:size-3!",
  {
    variants: {
      theme: {
        blue: "bg-blue-secondary text-blue-primary [a]:hover:bg-blue-primary/70",
        red: "bg-red-secondary text-red-primary [a]:hover:bg-red-primary/70",
        green: "bg-green-secondary text-green-primary [a]:hover:bg-green-primary/70",
        yellow: "bg-yellow-secondary text-yellow-primary [a]:hover:bg-yellow-primary/70",
        black: "bg-gray-background text-black-primary [a]:hover:bg-black-primary/70",
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
    />
  );
};
