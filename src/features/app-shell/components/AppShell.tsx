"use client";

import { useEffect } from "react";

import { AppSidebar } from "@/components/app-sidebar";
import { ModuleAccessGate } from "@/features/app-shell/components/ModuleAccessGate";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

import { AppBreadcrumbProvider } from "@/features/app-shell/providers/app-breadcrumb-provider";
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
    <SidebarProvider className={`${AUTHENTICATED_SHELL_CLASS} bg-dash-canvas`}>
      <AppSidebar />
      <SidebarInset className="bg-dash-canvas">
        <AppBreadcrumbProvider>
          <header className="flex h-12 shrink-0 items-center px-4 md:hidden">
            <SidebarTrigger />
          </header>
          <div className="flex min-h-0 flex-1 flex-col p-4">
            <div
              className={cn(
                "flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl bg-dash-panel shadow-[0_1px_2px_rgb(15_23_42/0.04),0_8px_24px_rgb(15_23_42/0.04)]",
                "has-[[data-page-surface=card]]:overflow-visible has-[[data-page-surface=card]]:rounded-none has-[[data-page-surface=card]]:bg-transparent has-[[data-page-surface=card]]:shadow-none",
              )}
            >
              <div className="flex min-h-0 flex-1 flex-col overflow-auto has-[[data-page-surface=card]]:overflow-hidden">
                <ModuleAccessGate>{children}</ModuleAccessGate>
              </div>
            </div>
          </div>
        </AppBreadcrumbProvider>
      </SidebarInset>
    </SidebarProvider>
  );
}
