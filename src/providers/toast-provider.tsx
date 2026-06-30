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
  description?: string;
  variant: ToastVariant;
};

type ToastVariantInput = {
  title: string;
  description?: string;
};

type ToastContextValue = {
  toast: (input: ToastInput) => void;
  dismiss: (id: string | number) => void;
  success: (input: ToastVariantInput) => void;
  error: (input: ToastVariantInput) => void;
  warning: (input: ToastVariantInput) => void;
  info: (input: ToastVariantInput) => void;
};

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

function normalizeToastText(value: string | undefined): string {
  if (value == null || value === "") {
    return "";
  }

  return value;
}

function showToast(input: ToastInput) {
  const title = normalizeToastText(input.title);
  const description = normalizeToastText(input.description);
  const message = title || description || "Something went wrong.";
  const options =
    title && description
      ? { description, duration: 5000 }
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

  const success = useCallback(
    (input: ToastVariantInput) => {
      showToast({ ...input, variant: "success" });
    },
    [],
  );

  const error = useCallback(
    (input: ToastVariantInput) => {
      showToast({ ...input, variant: "error" });
    },
    [],
  );

  const warning = useCallback(
    (input: ToastVariantInput) => {
      showToast({ ...input, variant: "warning" });
    },
    [],
  );

  const info = useCallback(
    (input: ToastVariantInput) => {
      showToast({ ...input, variant: "info" });
    },
    [],
  );

  const value = useMemo(
    () => ({ toast, dismiss, success, error, warning, info }),
    [toast, dismiss, success, error, warning, info],
  );

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
