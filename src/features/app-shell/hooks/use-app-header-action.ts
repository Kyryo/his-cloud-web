"use client";

import { useEffect, type ReactNode } from "react";

import { useAppBreadcrumbContext } from "@/features/app-shell/providers/app-breadcrumb-provider";

export function useAppHeaderAction(action: ReactNode) {
  const { setPageAction } = useAppBreadcrumbContext();

  useEffect(() => {
    setPageAction(action);
    return () => setPageAction(null);
  }, [action, setPageAction]);
}
