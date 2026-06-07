import { TrendingDown, TrendingUp } from "lucide-react";
import type { ReactNode } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type StatsCard1Props = {
  title: string;
  value: ReactNode;
  change?: number;
  changeLabel?: string;
  className?: string;
};

export function StatsCard1({
  title,
  value,
  change,
  changeLabel,
  className,
}: StatsCard1Props) {
  const showTrend = change !== undefined && changeLabel;

  return (
    <Card className={cn("w-full border-brand-border bg-slate-50/80 shadow-none", className)}>
      <CardHeader className="px-3 pb-0 pt-3">
        <CardTitle className="text-xs font-medium text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-3 pb-3 pt-1">
        <div className="text-lg font-bold tabular-nums leading-tight text-brand-navy">
          {value}
        </div>
        {showTrend ? (
          <div className="mt-0.5 flex items-center gap-1 text-xs">
            {change >= 0 ? (
              <TrendingUp className="size-3.5 text-green-500" />
            ) : (
              <TrendingDown className="size-3.5 text-red-500" />
            )}
            <span className={change >= 0 ? "text-green-500" : "text-red-500"}>
              {change >= 0 ? "+" : ""}
              {change}%
            </span>
            <span className="text-muted-foreground">{changeLabel}</span>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

type StatsCard1GridProps = {
  children: ReactNode;
  className?: string;
};

export function StatsCard1Grid({ children, className }: StatsCard1GridProps) {
  return (
    <div
      className={cn(
        "grid gap-2 sm:grid-cols-2 xl:grid-cols-4",
        className,
      )}
    >
      {children}
    </div>
  );
}
