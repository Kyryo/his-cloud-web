import type { ReactNode } from "react";

import { appFont } from "@/lib/fonts";
import { AuthGuard } from "@/features/auth/components/AuthGuard";
import { AppShell } from "@/features/app-shell/components/AppShell";
import { ToastProvider } from "@/providers/toast-provider";
import { UserProvider } from "@/providers/user-provider";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`${appFont.className} ${appFont.variable}`}>
      <AuthGuard>
        <UserProvider>
          <ToastProvider>
            <AppShell>{children}</AppShell>
          </ToastProvider>
        </UserProvider>
      </AuthGuard>
    </div>
  );
}
