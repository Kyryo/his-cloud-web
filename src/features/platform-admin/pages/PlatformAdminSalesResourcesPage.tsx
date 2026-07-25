"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";

import {
  ListPageHeaderSection,
  ListPageHeaderTitleBlock,
  ListPageHeaderTopRow,
  ListPageLayout,
} from "@/features/app-shell/components/page-layout";
import { getPlatformAdminSalesResourceSections } from "@/features/platform-admin/constants/sales-resource-cards";
import { cn } from "@/lib/utils";

export function PlatformAdminSalesResourcesPage() {
  const sections = getPlatformAdminSalesResourceSections();

  return (
    <ListPageLayout>
      <ListPageHeaderSection>
        <ListPageHeaderTopRow>
          <ListPageHeaderTitleBlock
            title="Sales"
            description="Resources and playbooks for the Sigma sales team."
          />
        </ListPageHeaderTopRow>
      </ListPageHeaderSection>

      <div className="w-full max-w-[75%] space-y-8">
        {sections.map((section) => (
          <section
            key={section.id}
            aria-labelledby={`sales-resource-section-${section.id}`}
          >
            <div className="mb-3">
              <h2
                id={`sales-resource-section-${section.id}`}
                className="text-sm font-semibold text-brand-navy"
              >
                {section.title}
              </h2>
              {section.description ? (
                <p className="mt-0.5 text-xs text-brand-muted">
                  {section.description}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              {section.items.map((resource) => {
                const Icon = resource.icon;

                return (
                  <Link key={resource.id} href={resource.href} className="group block">
                    <div
                      className={cn(
                        "flex items-center gap-3 rounded-lg border border-brand-border bg-white px-4 py-3 transition-colors",
                        "hover:border-brand-primary/40 hover:bg-brand-tint/30",
                      )}
                    >
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-brand-tint text-brand-primary">
                        <Icon className="size-4" aria-hidden="true" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="truncate text-sm font-medium text-brand-navy">
                            {resource.label}
                          </h3>
                          {resource.badge ? (
                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-brand-muted">
                              {resource.badge}
                            </span>
                          ) : null}
                        </div>
                        <p className="mt-0.5 line-clamp-1 text-xs text-brand-muted">
                          {resource.description}
                        </p>
                      </div>

                      <ChevronRight
                        className="size-4 shrink-0 text-brand-muted transition-transform group-hover:translate-x-0.5 group-hover:text-brand-primary"
                        aria-hidden="true"
                      />
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </ListPageLayout>
  );
}
