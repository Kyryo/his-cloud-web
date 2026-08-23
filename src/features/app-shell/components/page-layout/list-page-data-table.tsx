import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { cn } from "@/lib/utils";

type ListPageDataTableProps = {
  children: ReactNode;
  className?: string;
};

export function ListPageDataTable({
  children,
  className,
}: ListPageDataTableProps) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-dash-border bg-dash-panel",
        className,
      )}
    >
      <div className="overflow-x-auto">
        <table className="min-w-full">{children}</table>
      </div>
    </div>
  );
}

export function ListPageDataTableHeader({
  children,
}: {
  children: ReactNode;
}) {
  return <thead>{children}</thead>;
}

export function ListPageDataTableHeaderRow({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <tr className="border-b border-dash-border bg-dash-canvas/70">{children}</tr>
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
        "px-4 py-2.5 text-left text-[11px] font-medium uppercase tracking-[0.08em] text-dash-muted",
        className,
      )}
      {...props}
    />
  );
}

export function ListPageDataTableBody({
  children,
}: {
  children: ReactNode;
}) {
  return <tbody className="divide-y divide-dash-border">{children}</tbody>;
}

export function ListPageDataTableRow({
  className,
  ...props
}: ComponentPropsWithoutRef<"tr">) {
  return (
    <tr
      className={cn("transition-colors hover:bg-dash-canvas/80", className)}
      {...props}
    />
  );
}

export function ListPageDataTableCell({
  className,
  ...props
}: ComponentPropsWithoutRef<"td">) {
  return <td className={cn("px-4 py-2.5 text-sm", className)} {...props} />;
}
