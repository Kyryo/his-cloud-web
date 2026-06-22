import type { ReactNode } from "react";

import { AuthGuard } from "@/features/auth/components/AuthGuard";
import { AppShell } from "@/features/app-shell/components/AppShell";
import { PlatformAdminGuard } from "@/features/platform-admin/components/PlatformAdminGuard";
import { appFont } from "@/lib/fonts";
import { QueryProvider } from "@/providers/query-provider";
import { ToastProvider } from "@/providers/toast-provider";
import { UserProvider } from "@/providers/user-provider";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`${appFont.className} ${appFont.variable}`}>
      <AuthGuard>
        <UserProvider>
          <QueryProvider>
            <ToastProvider>
              <AppShell>
                <PlatformAdminGuard>{children}</PlatformAdminGuard>
              </AppShell>
            </ToastProvider>
          </QueryProvider>
        </UserProvider>
      </AuthGuard>
    </div>
  );
}
