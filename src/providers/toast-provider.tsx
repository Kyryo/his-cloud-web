"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import { toast as sonnerToast } from "sonner";

import { Toaster } from "@/components/ui/sonner";

export type ToastVariant = "success" | "error" | "warning" | "info";

type ToastInput = {
  title?: string;
  description: string;
  variant: ToastVariant;
};

type ToastContextValue = {
  toast: (input: ToastInput) => void;
  dismiss: (id: string | number) => void;
};

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

function showToast(input: ToastInput) {
  const message = input.title ?? input.description;
  const options = input.title
    ? { description: input.description, duration: 5000 }
    : { duration: 5000 };

  switch (input.variant) {
    case "success":
      sonnerToast.success(message, options);
      return;
    case "error":
      sonnerToast.error(message, options);
      return;
    case "warning":
      sonnerToast.warning(message, options);
      return;
    case "info":
    default:
      sonnerToast.info(message, options);
  }
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const dismiss = useCallback((id: string | number) => {
    sonnerToast.dismiss(id);
  }, []);

  const toast = useCallback((input: ToastInput) => {
    showToast(input);
  }, []);

  const value = useMemo(() => ({ toast, dismiss }), [toast, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Toaster position="bottom-right" />
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}
