"use client";

import { Suspense, useEffect } from "react";

import { AppSidebar } from "@/components/app-sidebar";
import { AppHeader } from "@/features/app-shell/components/AppHeader";
import { WorkspaceSetupBanner } from "@/features/app-shell/components/WorkspaceSetupBanner";
import { ModuleAccessGate } from "@/features/app-shell/components/ModuleAccessGate";
import { PageActivityBar } from "@/features/app-shell/components/PageActivityBar";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";

import { AppBreadcrumbProvider } from "@/features/app-shell/providers/app-breadcrumb-provider";
import { WorkspaceUsageRecorder } from "@/features/overview/components/WorkspaceUsageRecorder";
import { cn } from "@/lib/utils";

const AUTHENTICATED_SHELL_CLASS = "app-authenticated-shell";

/**
 * Authenticated app shell — sidebar is persistent layout chrome.
 * List pages sit on a white sheet; detail pages (`data-page-surface=card`)
 * supply their own card so they are not nested inside that sheet.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add(AUTHENTICATED_SHELL_CLASS);
    return () => {
      root.classList.remove(AUTHENTICATED_SHELL_CLASS);
    };
  }, []);

  return (
    <div className={`${AUTHENTICATED_SHELL_CLASS} flex h-full min-h-0 w-full flex-col overflow-hidden bg-dash-canvas`}>
      <WorkspaceSetupBanner />
      <SidebarProvider className="min-h-0 w-full flex-1 overflow-hidden bg-dash-canvas">
        <Suspense fallback={null}>
          <PageActivityBar />
        </Suspense>
        <WorkspaceUsageRecorder />
        <AppSidebar />
        <SidebarInset className="min-h-0 overflow-hidden bg-dash-canvas">
          <AppBreadcrumbProvider>
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
              <AppHeader />
              <div className="flex min-h-0 flex-1 flex-col overflow-hidden pl-4 pr-0 pb-4">
                <div
                  className={cn(
                    "flex min-h-0 flex-1 flex-col overflow-hidden rounded-l-2xl rounded-r-none bg-dash-panel shadow-[0_1px_2px_rgb(15_23_42/0.04),0_8px_24px_rgb(15_23_42/0.04)]",
                    "has-[[data-page-surface=card]]:rounded-none has-[[data-page-surface=card]]:bg-transparent has-[[data-page-surface=card]]:shadow-none",
                  )}
                >
                  <div className="relative flex min-h-0 flex-1 flex-col overflow-auto">
                    <ModuleAccessGate>{children}</ModuleAccessGate>
                  </div>
                </div>
              </div>
            </div>
          </AppBreadcrumbProvider>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
