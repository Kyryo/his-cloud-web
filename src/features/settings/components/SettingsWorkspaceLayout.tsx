"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { SettingsContentSkeleton } from "@/features/settings/components/SettingsContentSkeleton";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { SettingsNavigation } from "@/features/settings/components/SettingsNavigation";
import {
  buildSettingsNavigation,
  resolveSettingsBreadcrumbLabel,
} from "@/features/settings/constants/settings-navigation-config";
import { ROUTES } from "@/constants/routes";
import { useUser } from "@/providers/user-provider";

type SettingsWorkspaceLayoutProps = {
  children: ReactNode;
};

export function SettingsWorkspaceLayout({ children }: SettingsWorkspaceLayoutProps) {
  const pathname = usePathname();
  const { userData, isLoading } = useUser();
  const isTenantAdmin = Boolean(userData?.is_admin);
  const currentPage = resolveSettingsBreadcrumbLabel(
    pathname,
    buildSettingsNavigation(isTenantAdmin),
  );

  if (isLoading) {
    return (
      <div className="absolute inset-0 overflow-y-auto px-5 pt-8 md:px-10 lg:px-14">
        <SettingsContentSkeleton />
      </div>
    );
  }

  return (
    <div className="absolute inset-0 flex w-full flex-col overflow-hidden">
      <header className="shrink-0 border-b border-brand-border px-5 py-4 md:px-8">
        <Breadcrumb>
          <BreadcrumbList className="text-[15px] text-slate-400 sm:gap-1.5">
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link
                  href={ROUTES.settings}
                  className="font-semibold text-brand-navy hover:text-brand-navy"
                >
                  Settings
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="text-slate-300 [&>svg]:hidden">
              <span aria-hidden="true">&gt;</span>
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbPage className="font-normal text-slate-400">
                {currentPage}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <div className="shrink-0 px-5 pt-6 lg:px-8 lg:pt-8">
          <SettingsNavigation isTenantAdmin={isTenantAdmin} />
        </div>
        <div className="min-h-0 min-w-0 flex-1 overflow-y-auto px-5 pb-12 pt-6 md:px-10 lg:px-14 lg:pt-8">
          {children}
        </div>
      </div>
    </div>
  );
}
