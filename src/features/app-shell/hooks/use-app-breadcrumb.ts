"use client";

import { useEffect } from "react";

import { useAppBreadcrumbContext } from "@/features/app-shell/providers/app-breadcrumb-provider";

export function useAppBreadcrumb(pageLabel: string | null) {
  const { setPageLabel } = useAppBreadcrumbContext();

  useEffect(() => {
    setPageLabel(pageLabel);
    return () => setPageLabel(null);
  }, [pageLabel, setPageLabel]);
}
