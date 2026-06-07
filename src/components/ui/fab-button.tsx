import type { LucideIcon, LucideProps } from "lucide-react";
import { Plus } from "lucide-react";
import type { ComponentProps } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type FabButtonProps = Omit<ComponentProps<typeof Button>, "children"> & {
  label: string;
  icon?: LucideIcon;
  iconClassName?: LucideProps["className"];
  /** Hide the FAB from this breakpoint upward. Defaults to `sm`. */
  hideFrom?: "sm" | "md" | "lg" | "xl";
};

const hideFromClasses = {
  sm: "sm:hidden",
  md: "md:hidden",
  lg: "lg:hidden",
  xl: "xl:hidden",
} as const;

export function FabButton({
  label,
  icon: Icon = Plus,
  iconClassName,
  variant = "primary",
  hideFrom = "sm",
  className,
  ...props
}: FabButtonProps) {
  return (
    <Button
      type="button"
      variant={variant}
      size="icon"
      aria-label={label}
      className={cn(
        "fixed bottom-6 right-6 z-40 size-14 rounded-full shadow-lg",
        hideFromClasses[hideFrom],
        className,
      )}
      {...props}
    >
      <Icon className={cn("size-6", iconClassName)} aria-hidden="true" />
    </Button>
  );
}
