"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { AppBreadcrumbs } from "@/features/app-shell/components/AppBreadcrumbs";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

import { AppBreadcrumbProvider } from "@/features/app-shell/providers/app-breadcrumb-provider";

/**
 * Authenticated app shell — shadcn sidebar-07 page layout.
 * @see https://ui.shadcn.com/blocks#sidebar-07
 * @see web-new/AGENTS.md §3.5
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <AppBreadcrumbProvider>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b border-brand-border transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator
                orientation="vertical"
                className="mr-2 data-[orientation=vertical]:h-4"
              />
              <AppBreadcrumbs />
            </div>
          </header>
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <div className="min-h-[100vh] flex-1 bg-white md:min-h-min">
              {children}
            </div>
          </div>
        </AppBreadcrumbProvider>
      </SidebarInset>
    </SidebarProvider>
  );
}
