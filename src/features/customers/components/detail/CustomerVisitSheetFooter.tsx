import type { ReactNode } from "react";

type CustomerVisitSheetFooterProps = {
  recap?: string | null;
  children: ReactNode;
};

export function CustomerVisitSheetFooter({
  recap,
  children,
}: CustomerVisitSheetFooterProps) {
  return (
    <div className="flex flex-wrap items-center justify-end gap-3 border-t border-dash-border/60 bg-white px-6 py-4">
      {recap ? (
        <p className="mr-auto max-w-[18rem] text-xs leading-5 text-dash-muted">
          {recap}
        </p>
      ) : null}
      <div className="flex flex-wrap items-center justify-end gap-2">{children}</div>
    </div>
  );
}
