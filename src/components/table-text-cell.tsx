import Link from "next/link";
import type { MouseEvent, ReactNode } from "react";

import { ClientAvatar } from "@/components/client-avatar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatAmountNumber } from "@/features/sales-orders/utils/format-sales-order";
import { cn } from "@/lib/utils";

type TableTextCellProps = {
  children: ReactNode;
  className?: string;
  maxWidthClass?: string;
  title?: string;
};

export function TableTextCell({
  children,
  className,
  maxWidthClass = "max-w-[12rem]",
  title,
}: TableTextCellProps) {
  const resolvedTitle =
    title ??
    (typeof children === "string" || typeof children === "number"
      ? String(children)
      : undefined);

  return (
    <span
      className={cn("block truncate text-sm", maxWidthClass, className)}
      title={resolvedTitle}
    >
      {children}
    </span>
  );
}

export function TableAmountCell({
  value,
  currency,
  className,
}: {
  value: string | number | null | undefined;
  currency?: string;
  className?: string;
}) {
  const formatted = formatAmountNumber(value);

  if (formatted === "—") {
    return (
      <span className={cn("block text-right text-sm text-brand-slate", className)}>
        {formatted}
      </span>
    );
  }

  return (
    <div className={cn("text-right text-sm tabular-nums", className)}>
      <span className="font-medium text-brand-navy">{formatted}</span>
      {currency ? (
        <span className="ml-1.5 text-xs font-normal text-brand-muted">{currency}</span>
      ) : null}
    </div>
  );
}

export function UnassignedAvatar({ className }: { className?: string }) {
  return (
    <Avatar className={cn("size-9 shrink-0", className)}>
      <AvatarFallback className="border border-slate-300 bg-slate-100 text-xs font-medium text-brand-muted">
        ?
      </AvatarFallback>
    </Avatar>
  );
}

type TableEntityCellProps = {
  name: string;
  label?: string;
  href?: string;
  unassigned?: boolean;
  unassignedLabel?: string;
  className?: string;
  onClick?: (event: MouseEvent) => void;
};

export function TableEntityCell({
  name,
  label,
  href,
  unassigned = false,
  unassignedLabel = "Unassigned",
  className,
  onClick,
}: TableEntityCellProps) {
  const display = unassigned ? unassignedLabel : (label ?? name);
  const avatar = unassigned ? (
    <UnassignedAvatar className="size-7 shrink-0 text-[10px]" />
  ) : (
    <ClientAvatar name={name} className="size-7 shrink-0 text-[10px]" />
  );

  const body = (
    <>
      {avatar}
      <TableTextCell
        className={unassigned ? "text-brand-muted" : "text-brand-slate"}
        title={display}
      >
        {display}
      </TableTextCell>
    </>
  );

  if (href) {
    return (
      <div className={cn("flex min-w-0 max-w-[14rem] items-center", className)}>
        <Link
          href={href}
          className="flex min-w-0 items-center gap-2 hover:text-brand-primary hover:underline"
          onClick={onClick}
        >
          {body}
        </Link>
      </div>
    );
  }

  return (
    <div
      className={cn("flex min-w-0 max-w-[14rem] items-center gap-2", className)}
    >
      {body}
    </div>
  );
}
