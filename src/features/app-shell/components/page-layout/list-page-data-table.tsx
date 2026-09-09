import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { cn } from "@/lib/utils";

export type ListPageDataTableVariant = "card" | "plain";

type ListPageDataTableProps = {
  children: ReactNode;
  className?: string;
  variant?: ListPageDataTableVariant;
};

export function ListPageDataTable({
  children,
  className,
  variant = "plain",
}: ListPageDataTableProps) {
  return (
    <div
      className={cn(
        variant === "card"
          ? "overflow-hidden rounded-xl border border-dash-border bg-dash-panel"
          : "w-full overflow-hidden",
        className,
      )}
    >
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">{children}</table>
      </div>
    </div>
  );
}

export function ListPageDataTableHeader({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <thead className={cn(className)}>{children}</thead>;
}

export function ListPageDataTableHeaderRow({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <tr
      className={cn(
        "border-b border-dash-border/80 bg-white",
        className,
      )}
    >
      {children}
    </tr>
  );
}

export function ListPageDataTableHeaderCell({
  className,
  ...props
}: ComponentPropsWithoutRef<"th">) {
  return (
    <th
      scope="col"
      className={cn(
        "px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.06em] text-dash-muted",
        className,
      )}
      {...props}
    />
  );
}

export function ListPageDataTableBody({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <tbody className={cn("divide-y divide-dash-border/60", className)}>
      {children}
    </tbody>
  );
}

export function ListPageDataTableRow({
  className,
  ...props
}: ComponentPropsWithoutRef<"tr">) {
  return (
    <tr
      className={cn(
        "transition-colors hover:bg-dash-panel/60",
        className,
      )}
      {...props}
    />
  );
}

export function ListPageDataTableCell({
  className,
  ...props
}: ComponentPropsWithoutRef<"td">) {
  return <td className={cn("px-4 py-3.5 text-sm text-brand-slate", className)} {...props} />;
}
