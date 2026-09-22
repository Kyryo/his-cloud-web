"use client";

import type { ComponentProps, FormEventHandler, ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RequiredFieldMarker } from "@/components/ui/required-field-marker";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type OpdInlineComposerProps = {
  id: string;
  formId?: string;
  title?: string;
  description?: string;
  label: string;
  required?: boolean;
  placeholder?: string;
  rows?: number;
  error?: string;
  submitLabel: string;
  isPending?: boolean;
  disabled?: boolean;
  /** When false, omit the inline submit button (e.g. header Save). */
  showSubmitButton?: boolean;
  extra?: ReactNode;
  textareaProps?: ComponentProps<typeof Textarea>;
  onSubmit: FormEventHandler<HTMLFormElement>;
  className?: string;
  "data-testid"?: string;
};

export function OpdInlineComposer({
  id,
  formId,
  title,
  description,
  label,
  required = true,
  placeholder,
  rows = 4,
  error,
  submitLabel,
  isPending = false,
  disabled = false,
  showSubmitButton = true,
  extra,
  textareaProps,
  onSubmit,
  className,
  "data-testid": testId,
}: OpdInlineComposerProps) {
  const isDisabled = disabled || isPending;

  return (
    <form
      id={formId}
      className={cn("space-y-3", className)}
      onSubmit={onSubmit}
      data-testid={testId}
    >
      {title ? (
        <div>
          <h3 className="text-sm font-medium text-brand-navy">{title}</h3>
          {description ? (
            <p className="mt-0.5 text-sm text-dash-muted">{description}</p>
          ) : null}
        </div>
      ) : null}

      <div className="space-y-1.5">
        <Label htmlFor={id}>
          {label} {required ? <RequiredFieldMarker /> : null}
        </Label>
        <Textarea
          id={id}
          rows={rows}
          placeholder={placeholder}
          disabled={isDisabled}
          className="resize-y rounded-none border-0 border-b border-dash-border px-0 shadow-none focus-visible:ring-0"
          {...textareaProps}
        />
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
      </div>

      {extra}

      {showSubmitButton ? (
        <Button type="submit" disabled={isDisabled}>
          {isPending ? "Saving..." : submitLabel}
        </Button>
      ) : null}
    </form>
  );
}
