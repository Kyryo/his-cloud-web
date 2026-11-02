"use client";

import { Loader2 } from "lucide-react";

import { useTemplateBuilder } from "@/features/oh-template-builder/hooks/useTemplateBuilder";

type PublishTemplateButtonProps = {
  disabled?: boolean;
};

export function PublishTemplateButton({ disabled }: PublishTemplateButtonProps) {
  const { publishTemplate, isPending } = useTemplateBuilder();
  const isPublishing = isPending("template:publish");

  return (
    <button
      type="button"
      disabled={disabled || isPublishing}
      onClick={() => void publishTemplate()}
      className="inline-flex h-8 items-center gap-1.5 rounded-md bg-brand-primary px-3 text-[13px] font-medium text-white transition-colors hover:bg-brand-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/30 disabled:pointer-events-none disabled:opacity-50"
    >
      {isPublishing ? <Loader2 className="size-3.5 animate-spin" aria-hidden /> : null}
      {isPublishing ? "Publishing" : "Publish"}
    </button>
  );
}
