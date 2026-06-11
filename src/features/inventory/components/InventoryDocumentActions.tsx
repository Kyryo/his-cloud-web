"use client";

import { Loader2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type InventoryDocumentAction = {
  key: string;
  label: string;
  variant?: "default" | "outline" | "destructive";
  onClick: () => void | Promise<void>;
};

type InventoryDocumentActionsProps = {
  actions: InventoryDocumentAction[];
  className?: string;
};

export function InventoryDocumentActions({
  actions,
  className,
}: InventoryDocumentActionsProps) {
  const [loadingKey, setLoadingKey] = useState<string | null>(null);

  if (actions.length === 0) {
    return null;
  }

  async function handleAction(action: InventoryDocumentAction) {
    setLoadingKey(action.key);
    try {
      await action.onClick();
    } finally {
      setLoadingKey(null);
    }
  }

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {actions.map((action) => {
        const isLoading = loadingKey === action.key;

        return (
          <Button
            key={action.key}
            type="button"
            variant={action.variant ?? "outline"}
            size="sm"
            disabled={loadingKey !== null}
            onClick={() => void handleAction(action)}
          >
            {isLoading ? (
              <Loader2 className="mr-2 size-4 animate-spin" aria-hidden="true" />
            ) : null}
            {action.label}
          </Button>
        );
      })}
    </div>
  );
}
