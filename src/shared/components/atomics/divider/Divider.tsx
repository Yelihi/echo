import { cn } from "@/shared/utils/cn";

export const Divider = ({ className, ...props }: React.ComponentProps<"div">) => {
  return <div className={cn("w-full h-px bg-gray-border", className)} {...props} />;
};
