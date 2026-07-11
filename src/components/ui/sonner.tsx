"use client";

import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Info,
  Loader2,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";

export function Toaster({ ...props }: ToasterProps) {
  const { theme = "light" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: (
          <CheckCircle2 className="size-4 shrink-0 text-emerald-600" aria-hidden="true" />
        ),
        error: (
          <AlertCircle className="size-4 shrink-0 text-red-600" aria-hidden="true" />
        ),
        warning: (
          <AlertTriangle className="size-4 shrink-0 text-amber-600" aria-hidden="true" />
        ),
        info: (
          <Info className="size-4 shrink-0 text-brand-primary" aria-hidden="true" />
        ),
        loading: (
          <Loader2
            className="size-4 shrink-0 animate-spin text-brand-muted"
            aria-hidden="true"
          />
        ),
      }}
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          success:
            "group-[.toaster]:border-l-[3px] group-[.toaster]:border-l-emerald-600",
          error:
            "group-[.toaster]:border-l-[3px] group-[.toaster]:border-l-destructive",
          warning:
            "group-[.toaster]:border-l-[3px] group-[.toaster]:border-l-amber-500",
          info:
            "group-[.toaster]:border-l-[3px] group-[.toaster]:border-l-brand-primary",
        },
      }}
      {...props}
    />
  );
}
