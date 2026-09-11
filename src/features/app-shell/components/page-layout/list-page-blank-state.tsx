import type { ReactNode } from "react";

import { AppIcon, type AppIconName } from "@/components/icons/app-icon";
import { cn } from "@/lib/utils";

type ListPageBlankStateProps = {
  title: string;
  description: string;
  icon?: AppIconName;
  action?: ReactNode;
  tone?: "default" | "error";
  compact?: boolean;
  "data-testid"?: string;
};

export function ListPageBlankState({
  title,
  description,
  icon,
  action,
  tone = "default",
  compact = false,
  "data-testid": dataTestId,
}: ListPageBlankStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center px-6 text-center",
        compact
          ? "py-14"
          : "min-h-[min(380px,calc(100vh-16rem))] py-16",
      )}
      data-testid={dataTestId}
    >
      {icon ? (
        <span
          className={cn(
            "flex size-11 items-center justify-center rounded-xl",
            tone === "error"
              ? "bg-red-50 text-red-700"
              : "bg-dash-canvas text-dash-muted",
          )}
        >
          <AppIcon name={icon} size={22} />
        </span>
      ) : null}
      <h2
        className={cn(
          "text-pretty text-base font-semibold tracking-tight",
          icon ? "mt-4" : null,
          tone === "error" ? "text-red-800" : "text-brand-navy",
        )}
      >
        {title}
      </h2>
      <p
        className={cn(
          "mt-2 max-w-sm text-pretty text-sm",
          tone === "error" ? "text-red-700" : "text-brand-muted",
        )}
      >
        {description}
      </p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
