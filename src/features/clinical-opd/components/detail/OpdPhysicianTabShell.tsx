"use client";

import type { ReactNode } from "react";

type OpdPhysicianTabShellProps = {
  visitUuid: string;
  encounterUuid: string;
  children: ReactNode;
};

export function OpdPhysicianTabShell({ children }: OpdPhysicianTabShellProps) {
  return (
    <div className="pt-4" data-testid="opd-physician-tab-shell">
      {children}
    </div>
  );
}
