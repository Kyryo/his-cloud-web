import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "border-transparent bg-brand-primary text-white",
        secondary:
          "border-transparent bg-brand-tint text-brand-navy",
        outline: "border-brand-border text-brand-slate",
        warning:
          "border-amber-200 bg-amber-50 text-amber-800",
        success:
          "border-emerald-200 bg-emerald-50 text-emerald-800",
        destructive:
          "border-red-200 bg-red-50 text-red-800",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
