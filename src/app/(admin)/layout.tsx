import type { ReactNode } from "react";

import { AuthGuard } from "@/features/auth/components/AuthGuard";
import { AppShell } from "@/features/app-shell/components/AppShell";
import { PlatformAdminGuard } from "@/features/platform-admin/components/PlatformAdminGuard";
import { appFont } from "@/lib/fonts";
import { QueryProvider } from "@/providers/query-provider";
import { ToastProvider } from "@/providers/toast-provider";

/** Platform admin. Same app host as the clinic dashboard. */
export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`${appFont.className} ${appFont.variable} h-svh overflow-hidden bg-dash-canvas`}>
      <QueryProvider>
        <ToastProvider>
          <AuthGuard>
            <AppShell>
              <PlatformAdminGuard>{children}</PlatformAdminGuard>
            </AppShell>
          </AuthGuard>
        </ToastProvider>
      </QueryProvider>
    </div>
  );
}
