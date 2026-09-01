"use client";

import type { ReactNode } from "react";

import { PageLoader } from "@/components/page-loader";
import { SettingsNavigation } from "@/features/settings/components/SettingsNavigation";
import { SETTINGS_WORKSPACE_DESCRIPTION } from "@/features/settings/constants/settings-navigation-config";
import { useUser } from "@/providers/user-provider";

type SettingsWorkspaceLayoutProps = {
  children: ReactNode;
};

export function SettingsWorkspaceLayout({ children }: SettingsWorkspaceLayoutProps) {
  const { userData, isLoading } = useUser();
  const isTenantAdmin = Boolean(userData?.is_admin);

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <PageLoader />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 md:px-8 md:py-8">
      <header className="border-b border-brand-border pb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-brand-navy">
          Settings
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-brand-muted">
          {SETTINGS_WORKSPACE_DESCRIPTION}
        </p>
      </header>

      <div className="mt-6 flex flex-col gap-6 lg:mt-8 lg:flex-row lg:gap-10">
        <SettingsNavigation isTenantAdmin={isTenantAdmin} />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
