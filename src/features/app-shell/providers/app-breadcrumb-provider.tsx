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
  pageAction: ReactNode;
  setPageLabel: (label: string | null) => void;
  setPageAction: (action: ReactNode) => void;
};

const AppBreadcrumbContext = createContext<AppBreadcrumbContextValue | null>(
  null,
);

export function AppBreadcrumbProvider({ children }: { children: ReactNode }) {
  const [pageLabel, setPageLabelState] = useState<string | null>(null);
  const [pageAction, setPageActionState] = useState<ReactNode>(null);

  const setPageLabel = useCallback((label: string | null) => {
    setPageLabelState(label);
  }, []);
  const setPageAction = useCallback((action: ReactNode) => {
    setPageActionState(action);
  }, []);

  const value = useMemo(
    () => ({ pageLabel, pageAction, setPageAction, setPageLabel }),
    [pageAction, pageLabel, setPageAction, setPageLabel],
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
