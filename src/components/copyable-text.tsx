"use client";

import { Copy } from "lucide-react";
import type { MouseEvent } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useToast } from "@/providers/toast-provider";

type CopyableTextProps = {
  value: string;
  className?: string;
  copyLabel?: string;
  copiedToastMessage?: string;
  alwaysShowCopy?: boolean;
};

export function CopyableText({
  value,
  className,
  copyLabel = "Copy to clipboard",
  copiedToastMessage,
  alwaysShowCopy = false,
}: CopyableTextProps) {
  const { toast } = useToast();

  async function handleCopy(event: MouseEvent<HTMLButtonElement>) {
    event.stopPropagation();
    event.preventDefault();

    try {
      await navigator.clipboard.writeText(value);
      toast({
        variant: "success",
        title: copiedToastMessage ?? "Copied to clipboard",
        description: copiedToastMessage ? undefined : value,
      });
    } catch {
      toast({
        variant: "error",
        title: "Could not copy",
        description: "Your browser blocked clipboard access.",
      });
    }
  }

  return (
    <span
      className={cn(
        "group/copy inline-flex max-w-full items-center gap-1",
        className,
      )}
    >
      <span className="truncate">{value}</span>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className={cn(
          "size-6 shrink-0 text-brand-muted transition-opacity focus-visible:opacity-100",
          alwaysShowCopy
            ? "opacity-100"
            : "opacity-0 group-hover/copy:opacity-100",
        )}
        aria-label={copyLabel}
        onClick={(event) => void handleCopy(event)}
      >
        <Copy className="size-3.5" aria-hidden="true" />
      </Button>
    </span>
  );
}
