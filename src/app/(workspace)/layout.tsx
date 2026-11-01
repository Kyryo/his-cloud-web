import type { ReactNode } from "react";

import { AuthGuard } from "@/features/auth/components/AuthGuard";
import { appFont } from "@/lib/fonts";
import { QueryProvider } from "@/providers/query-provider";
import { ToastProvider } from "@/providers/toast-provider";

/** Full-screen authenticated workspaces (builders, editors) without the sidebar shell. */
export default function WorkspaceLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`${appFont.className} ${appFont.variable} h-svh overflow-hidden bg-dash-canvas`}>
      <QueryProvider>
        <ToastProvider>
          <AuthGuard>{children}</AuthGuard>
        </ToastProvider>
      </QueryProvider>
    </div>
  );
}
