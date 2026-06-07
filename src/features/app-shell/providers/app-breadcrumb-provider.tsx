"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type AppBreadcrumbContextValue = {
  pageLabel: string | null;
  setPageLabel: (label: string | null) => void;
};

const AppBreadcrumbContext = createContext<AppBreadcrumbContextValue | null>(
  null,
);

export function AppBreadcrumbProvider({ children }: { children: ReactNode }) {
  const [pageLabel, setPageLabelState] = useState<string | null>(null);

  const setPageLabel = useCallback((label: string | null) => {
    setPageLabelState(label);
  }, []);

  const value = useMemo(
    () => ({ pageLabel, setPageLabel }),
    [pageLabel, setPageLabel],
  );

  return (
    <AppBreadcrumbContext.Provider value={value}>
      {children}
    </AppBreadcrumbContext.Provider>
  );
}

export function useAppBreadcrumbContext() {
  const context = useContext(AppBreadcrumbContext);
  if (!context) {
    throw new Error(
      "useAppBreadcrumbContext must be used within AppBreadcrumbProvider",
    );
  }

  return context;
}
