import type { ReactNode } from "react";

import {
  PAGE_DESCRIPTION_CLASS,
  PAGE_TITLE_CLASS,
} from "@/features/app-shell/components/page-layout/page-layout-typography";
import { cn } from "@/lib/utils";

type DetailPageTitleProps = {
  children: ReactNode;
  className?: string;
};

export function DetailPageTitle({ children, className }: DetailPageTitleProps) {
  return <h1 className={cn("truncate", PAGE_TITLE_CLASS, className)}>{children}</h1>;
}

type DetailPageDescriptionProps = {
  children: ReactNode;
  className?: string;
};

export function DetailPageDescription({
  children,
  className,
}: DetailPageDescriptionProps) {
  return <p className={cn("mt-1", PAGE_DESCRIPTION_CLASS, className)}>{children}</p>;
}

type DetailPageNotFoundProps = {
  title: string;
  message: string;
  children?: ReactNode;
  tone?: "danger" | "warning";
};

export function DetailPageNotFound({
  title,
  message,
  children,
  tone = "danger",
}: DetailPageNotFoundProps) {
  const isWarning = tone === "warning";

  return (
    <div
      className={cn(
        "rounded-xl border p-6",
        isWarning
          ? "border-amber-200 bg-amber-50"
          : "border-red-200 bg-red-50",
      )}
    >
      <DetailPageTitle
        className={cn(
          "whitespace-normal",
          isWarning ? "text-amber-900" : "text-red-800",
        )}
      >
        {title}
      </DetailPageTitle>
      <DetailPageDescription
        className={cn("mt-2", isWarning ? "text-amber-800" : "text-red-700")}
      >
        {message}
      </DetailPageDescription>
      {children}
    </div>
  );
}
