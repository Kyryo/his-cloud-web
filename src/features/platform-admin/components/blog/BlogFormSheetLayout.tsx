import type { ReactNode } from "react";

import { SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

type BlogFormSheetLayoutProps = {
  title: string;
  description?: string;
  footer: ReactNode;
  children: ReactNode;
  className?: string;
};

/** Header, scrolling body and pinned footer for blog side panels. */
export function BlogFormSheetLayout({ title, description, footer, children, className }: BlogFormSheetLayoutProps) {
  return (
    <div className={cn("-m-6 flex h-[calc(100%+3rem)] flex-col", className)}>
      <SheetHeader className="border-b border-dash-border/80 px-6 py-4 text-left">
        <SheetTitle>{title}</SheetTitle>
        {description ? <SheetDescription>{description}</SheetDescription> : null}
      </SheetHeader>
      <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">{children}</div>
      <div className="flex items-center justify-end gap-2 border-t border-dash-border/80 px-6 py-3">{footer}</div>
    </div>
  );
}

type BlogFormSectionProps = {
  title: string;
  children: ReactNode;
};

/** Titled group inside a sheet; groups are separated by hairlines rather than boxes. */
export function BlogFormSection({ title, children }: BlogFormSectionProps) {
  return (
    <section className="border-b border-dash-border/60 pb-6 pt-1 last:border-b-0 [&+&]:pt-5">
      <h3 className="mb-3 text-[11px] font-medium uppercase tracking-[0.08em] text-dash-muted">{title}</h3>
      {children}
    </section>
  );
}
