import type { ReactNode } from "react";

import {
  PAGE_DESCRIPTION_CLASS,
  PAGE_TITLE_CLASS,
} from "@/features/app-shell/components/page-layout/page-layout-typography";
import { cn } from "@/lib/utils";

type ListPageHeaderSectionProps = {
  children: ReactNode;
  className?: string;
};

export function ListPageHeaderSection({
  children,
  className,
}: ListPageHeaderSectionProps) {
  return <div className={cn("space-y-3", className)}>{children}</div>;
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
        "flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between",
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

export function ListPageHeaderTitleBlock({
  title,
  description,
  className,
}: ListPageHeaderTitleBlockProps) {
  return (
    <div className={cn("min-w-0 flex-1", className)}>
      <h1 className={PAGE_TITLE_CLASS}>{title}</h1>
      {description ? (
        <p className={cn("mt-0.5 max-w-2xl", PAGE_DESCRIPTION_CLASS)}>
          {description}
        </p>
      ) : null}
    </div>
  );
}

type ListPageHeaderActionsProps = {
  children: ReactNode;
  className?: string;
};

export function ListPageHeaderActions({
  children,
  className,
}: ListPageHeaderActionsProps) {
  return <div className={cn("shrink-0", className)}>{children}</div>;
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
