"use client";

import { useCallback, useState } from "react";

import { getErrorMessage, logFetchError } from "@/lib/fetch-error";
import { useToast } from "@/providers/toast-provider";

type ActionMessages = {
  success?: string;
  error: string;
};

/**
 * Runs a builder mutation with consistent toasts and a pending key so the
 * UI can show which control is busy. Resolves to `null` when the action fails.
 */
export function useBuilderAction() {
  const { toast } = useToast();
  const [pendingKeys, setPendingKeys] = useState<readonly string[]>([]);

  const perform = useCallback(
    async <T>(
      key: string,
      action: () => Promise<T>,
      messages: ActionMessages,
    ): Promise<T | null> => {
      setPendingKeys((current) => [...current, key]);
      try {
        const result = await action();
        if (messages.success) {
          toast({ variant: "success", title: messages.success });
        }
        return result;
      } catch (error) {
        logFetchError(`oh-template-builder:${key}`, error);
        toast({
          variant: "error",
          title: messages.error,
          description: getErrorMessage(error, "Try again in a moment."),
        });
        return null;
      } finally {
        setPendingKeys((current) => {
          const index = current.indexOf(key);
          return index === -1
            ? current
            : [...current.slice(0, index), ...current.slice(index + 1)];
        });
      }
    },
    [toast],
  );

  const isPending = useCallback(
    (key: string) => pendingKeys.includes(key),
    [pendingKeys],
  );

  return { perform, isPending, isBusy: pendingKeys.length > 0 };
}
