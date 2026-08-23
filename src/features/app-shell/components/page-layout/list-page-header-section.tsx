import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type ListPageHeaderSectionProps = {
  children: ReactNode;
  className?: string;
};

export function ListPageHeaderSection({
  children,
  className,
}: ListPageHeaderSectionProps) {
  return <div className={cn("space-y-4", className)}>{children}</div>;
}

type ListPageHeaderTopRowProps = {
  children: ReactNode;
  className?: string;
};

export function ListPageHeaderTopRow({
  children,
  className,
}: ListPageHeaderTopRowProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-end",
        className,
      )}
    >
      {children}
    </div>
  );
}

type ListPageHeaderTitleBlockProps = {
  title: ReactNode;
  description?: ReactNode;
  className?: string;
};

export function ListPageHeaderTitleBlock(_props: ListPageHeaderTitleBlockProps) {
  return null;
}

type ListPageHeaderActionsProps = {
  children: ReactNode;
  className?: string;
};

export function ListPageHeaderActions({
  children,
  className,
}: ListPageHeaderActionsProps) {
  return <div className={className}>{children}</div>;
}

type ListPageHeaderMobileSearchProps = {
  children: ReactNode;
  className?: string;
};

export function ListPageHeaderMobileSearch({
  children,
  className,
}: ListPageHeaderMobileSearchProps) {
  return (
    <div className={cn("flex w-full flex-col gap-2 sm:hidden", className)}>
      {children}
    </div>
  );
}
