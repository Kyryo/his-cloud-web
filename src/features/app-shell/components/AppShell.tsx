"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { ModuleAccessGate } from "@/features/app-shell/components/ModuleAccessGate";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

import { AppBreadcrumbProvider } from "@/features/app-shell/providers/app-breadcrumb-provider";

/**
 * Authenticated app shell — sidebar is persistent layout chrome.
 * Visual language: shared canvas behind sidebar + body, white page sheet.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider className="bg-dash-canvas">
      <AppSidebar />
      <SidebarInset className="bg-dash-canvas">
        <AppBreadcrumbProvider>
          <header className="flex h-12 shrink-0 items-center px-4 md:hidden">
            <SidebarTrigger />
          </header>
          <div className="flex flex-1 flex-col p-4">
            <div className="flex flex-1 flex-col rounded-2xl bg-dash-panel shadow-[0_1px_2px_rgb(15_23_42/0.04),0_8px_24px_rgb(15_23_42/0.04)]">
              <ModuleAccessGate>{children}</ModuleAccessGate>
            </div>
          </div>
        </AppBreadcrumbProvider>
      </SidebarInset>
    </SidebarProvider>
  );
}
