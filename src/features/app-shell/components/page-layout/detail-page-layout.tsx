import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type DetailPageLayoutProps = {
  children: ReactNode;
  className?: string;
  "data-testid"?: string;
};

export function DetailPageLayout({
  children,
  className,
  "data-testid": dataTestId,
}: DetailPageLayoutProps) {
  return (
    <div
      className={cn("-mx-4 flex flex-col pb-20 xl:pb-0", className)}
      data-testid={dataTestId}
    >
      {children}
    </div>
  );
}
