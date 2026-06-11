"use client";

import { Plus } from "lucide-react";
import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

type AddPurchaseOrderLineItemButtonProps = ComponentProps<"button">;

export function AddPurchaseOrderLineItemButton({
  className,
  type = "button",
  children,
  ...props
}: AddPurchaseOrderLineItemButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "group inline-flex items-center gap-1.5 text-sm font-medium text-brand-primary",
        "rounded-full border border-transparent px-1 py-1 transition-all duration-200",
        "hover:border-brand-border hover:bg-brand-tint hover:px-4 hover:py-2 hover:text-brand-navy hover:shadow-sm",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/25",
        className,
      )}
      {...props}
    >
      <Plus className="size-4 shrink-0" aria-hidden="true" />
      <span className="underline decoration-brand-primary/40 underline-offset-2 group-hover:no-underline">
        {children ?? "Add line item"}
      </span>
    </button>
  );
}
