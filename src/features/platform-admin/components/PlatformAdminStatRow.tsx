import type { LucideIcon } from "lucide-react";

export type PlatformAdminStat = {
  icon: LucideIcon;
  label: string;
  value: string;
  detail?: string;
  emptyHint?: string;
};

/** Horizontal stat strip separated by dividers instead of boxed cards. */
export function PlatformAdminStatRow({
  stats,
}: {
  stats: PlatformAdminStat[];
}) {
  return (
    <dl className="grid grid-cols-2 divide-border border-y border-border md:grid-cols-4 md:divide-x [&>div:nth-child(odd)]:border-r [&>div:nth-child(odd)]:border-border md:[&>div:nth-child(odd)]:border-r-0 [&>div:nth-child(-n+2)]:border-b md:[&>div:nth-child(-n+2)]:border-b-0">
      {stats.map(({ icon: Icon, label, value, detail, emptyHint }) => (
        <div key={label} className="space-y-1 px-4 py-5 first:pl-0 md:px-6">
          <dt className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <Icon className="size-3.5" aria-hidden />
            {label}
          </dt>
          <dd className="text-2xl font-semibold tracking-tight text-foreground tabular-nums">
            {value}
          </dd>
          {detail ? (
            <dd className="text-xs text-muted-foreground">{detail}</dd>
          ) : null}
          {emptyHint ? (
            <dd className="text-xs text-muted-foreground/80 italic">
              {emptyHint}
            </dd>
          ) : null}
        </div>
      ))}
    </dl>
  );
}
