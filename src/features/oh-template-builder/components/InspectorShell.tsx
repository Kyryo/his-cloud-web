import type { ReactNode } from "react";

type InspectorShellProps = {
  eyebrow: ReactNode;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
};

export function InspectorShell({ eyebrow, title, children, footer }: InspectorShellProps) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="border-b border-dash-border px-5 pb-4 pt-5">
        <div className="text-xs text-dash-muted">{eyebrow}</div>
        <h2 className="mt-1 truncate text-base font-semibold tracking-tight text-brand-navy">
          {title}
        </h2>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">{children}</div>
      {footer ? (
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-dash-border bg-white px-5 py-3">
          {footer}
        </div>
      ) : null}
    </div>
  );
}

export function InspectorToggleRow({
  title,
  description,
  control,
}: {
  title: string;
  description: string;
  control: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-dash-border px-4 py-3">
      <div>
        <p className="text-sm font-medium text-brand-navy">{title}</p>
        <p className="mt-0.5 text-xs leading-5 text-dash-muted">{description}</p>
      </div>
      {control}
    </div>
  );
}
