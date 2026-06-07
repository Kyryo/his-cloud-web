import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type DetailPageHeaderSectionProps = {
  children: ReactNode;
  className?: string;
};

export function DetailPageHeaderSection({
  children,
  className,
}: DetailPageHeaderSectionProps) {
  return (
    <header
      className={cn(
        "border-b border-brand-border bg-white px-4 py-3 sm:px-6 sm:py-4",
        className,
      )}
    >
      {children}
    </header>
  );
}
