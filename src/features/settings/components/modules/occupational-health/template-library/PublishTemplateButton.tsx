"use client";

import { Loader2, Rocket } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useTemplateBuilder } from "@/features/oh-template-builder/hooks/useTemplateBuilder";

type PublishTemplateButtonProps = {
  disabled?: boolean;
};

export function PublishTemplateButton({ disabled }: PublishTemplateButtonProps) {
  const { publishTemplate, isPending } = useTemplateBuilder();
  const isPublishing = isPending("template:publish");

  return (
    <Button
      type="button"
      size="sm"
      variant="outline"
      disabled={disabled || isPublishing}
      onClick={() => void publishTemplate()}
      className="gap-1.5"
    >
      {isPublishing ? (
        <Loader2 className="size-3.5 animate-spin" aria-hidden />
      ) : (
        <Rocket className="size-3.5" aria-hidden />
      )}
      {isPublishing ? "Publishing…" : "Publish"}
    </Button>
  );
}
