"use client";

import Link from "next/link";

import { AppIcon } from "@/components/icons/app-icon";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import {
  ListPageHeaderActions,
  ListPageHeaderSection,
  ListPageHeaderTitleBlock,
  ListPageHeaderTopRow,
} from "@/features/app-shell/components/page-layout";

type CustomersPageHeaderProps = {
  onAddClient: () => void;
  totalCount?: number;
};

export function CustomersPageHeader({
  onAddClient,
  totalCount,
}: CustomersPageHeaderProps) {
  return (
    <ListPageHeaderSection>
      <ListPageHeaderTopRow>
        <ListPageHeaderTitleBlock
          title={
            <div className="flex flex-wrap items-center gap-2.5">
              <span>Clients</span>
              {totalCount !== undefined && totalCount > 0 ? (
                <span className="inline-flex items-center rounded-full bg-brand-tint px-2.5 py-0.5 text-xs font-semibold text-brand-primary">
                  {totalCount} registered
                </span>
              ) : null}
            </div>
          }
          description="Manage client registrations, visits, and clinical activity."
        />

        <ListPageHeaderActions>
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <Button
              asChild
              variant="outline"
              size="sm"
              className="hidden gap-1.5 rounded-lg border-dash-border text-xs text-brand-slate hover:border-emerald-300 hover:text-emerald-700 sm:inline-flex"
            >
              <Link href={ROUTES.activeVisits}>
                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <AppIcon name="heartPulse" className="size-3.5 text-emerald-600" />
                <span>Active Queue</span>
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="sm"
              className="hidden gap-1.5 rounded-lg border-dash-border text-xs text-brand-slate hover:border-blue-300 hover:text-blue-700 sm:inline-flex"
            >
              <Link href={ROUTES.appointments}>
                <AppIcon name="calendar" className="size-3.5 text-blue-600" />
                <span>Appointments</span>
              </Link>
            </Button>
            <Button
              size="sm"
              className="gap-1.5 rounded-lg bg-brand-primary text-xs font-medium text-white shadow-sm hover:bg-brand-primary-hover active:scale-[0.98] transition-all"
              onClick={onAddClient}
              data-testid="add-client-button"
            >
              <AppIcon name="add" className="size-3.5" />
              <span>Register Client</span>
            </Button>
          </div>
        </ListPageHeaderActions>
      </ListPageHeaderTopRow>
    </ListPageHeaderSection>
  );
}
