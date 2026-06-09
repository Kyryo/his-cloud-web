import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type ListPageLayoutProps = {
  children: ReactNode;
  className?: string;
  "data-testid"?: string;
};

/** Horizontal inset aligned with settings pages (`SettingsPageLayout`). */
const LIST_PAGE_INSET_CLASS =
  "mx-auto w-full px-4 md:px-6";

export function ListPageLayout({
  children,
  className,
  "data-testid": dataTestId,
}: ListPageLayoutProps) {
  return (
    <div
      className={cn(
        LIST_PAGE_INSET_CLASS,
        "space-y-6 pb-20 pt-6 sm:pb-4",
        className,
      )}
      data-testid={dataTestId}
    >
      {children}
    </div>
  );
}
