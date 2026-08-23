import type { ReactNode } from "react";

import { appFont } from "@/lib/fonts";
import { AuthGuard } from "@/features/auth/components/AuthGuard";
import { AppShell } from "@/features/app-shell/components/AppShell";
import { QueryProvider } from "@/providers/query-provider";
import { ToastProvider } from "@/providers/toast-provider";
import { UserProvider } from "@/providers/user-provider";

/** Clinic dashboard. Served on the app host (app.example.com) when host routing is on. */

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`${appFont.className} ${appFont.variable} min-h-svh bg-dash-canvas`}>
      <AuthGuard>
        <UserProvider>
          <QueryProvider>
            <ToastProvider>
              <AppShell>{children}</AppShell>
            </ToastProvider>
          </QueryProvider>
        </UserProvider>
      </AuthGuard>
    </div>
  );
}
