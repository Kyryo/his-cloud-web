import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export type ProductDetailField = {
  label: string;
  value: ReactNode;
  hidden?: boolean;
};

type ProductDetailFieldListProps = {
  title?: string;
  action?: ReactNode;
  fields: ProductDetailField[];
  className?: string;
  "data-testid"?: string;
};

export function ProductDetailFieldList({
  title,
  action,
  fields,
  className,
  "data-testid": dataTestId,
}: ProductDetailFieldListProps) {
  const visibleFields = fields.filter((field) => !field.hidden);

  if (visibleFields.length === 0 && !action) {
    return null;
  }

  return (
    <section
      className={cn(
        "rounded-xl border border-brand-border bg-white p-5 text-sm",
        className,
      )}
      data-testid={dataTestId}
    >
      {title || action ? (
        <div className="mb-3 flex items-start justify-between gap-3">
          {title ? (
            <h3 className="text-sm font-semibold text-brand-navy">{title}</h3>
          ) : (
            <span />
          )}
          {action}
        </div>
      ) : null}
      {visibleFields.length > 0 ? (
        <dl className="space-y-3">
          {visibleFields.map((field) => (
            <div
              key={field.label}
              className="flex items-start justify-between gap-4"
            >
              <dt className="text-brand-muted">{field.label}</dt>
              <dd className="text-right font-medium text-brand-navy">
                {field.value}
              </dd>
            </div>
          ))}
        </dl>
      ) : null}
    </section>
  );
}
