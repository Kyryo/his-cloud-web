"use client";

import { FormControl, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { TagBadge } from "@/features/tags/components/TagBadge";
import type { Control, FieldPath, FieldValues } from "react-hook-form";
import { FormField } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";

const DEFAULT_TAG_COLOR = "#2563eb";

type TagColorFieldProps = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  label?: string;
};

export function TagColorField({
  value,
  onChange,
  disabled = false,
  label = "Color",
}: TagColorFieldProps) {
  const pickerValue = /^#(?:[0-9a-fA-F]{3}){1,2}$/.test(value.trim())
    ? value.trim()
    : DEFAULT_TAG_COLOR;

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-brand-navy">{label}</p>
      <div className="flex items-center gap-3">
        <input
          type="color"
          value={pickerValue}
          onChange={(event) => onChange(event.target.value)}
          className="size-10 shrink-0 cursor-pointer rounded-lg border border-brand-border bg-white p-1 disabled:cursor-not-allowed disabled:opacity-50"
          aria-label={`${label} picker`}
          disabled={disabled}
        />
        <Input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="#2563eb"
          disabled={disabled}
          className="font-mono text-sm"
        />
        <TagBadge
          tag={{
            name: "Preview",
            color: value.trim() || "",
          }}
          className="shrink-0"
        />
      </div>
    </div>
  );
}

type ClientTagFormFieldsProps<T extends FieldValues> = {
  control: Control<T>;
  isSubmitting?: boolean;
  idPrefix: string;
};

export function ClientTagFormFields<T extends FieldValues>({
  control,
  isSubmitting = false,
  idPrefix,
}: ClientTagFormFieldsProps<T>) {
  return (
    <>
      <FormField
        control={control}
        name={"name" as FieldPath<T>}
        render={({ field }) => (
          <FormItem>
            <FormLabel htmlFor={`${idPrefix}-name`}>Name</FormLabel>
            <FormControl>
              <Input
                {...field}
                id={`${idPrefix}-name`}
                disabled={isSubmitting}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name={"color" as FieldPath<T>}
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <TagColorField
                value={field.value ?? ""}
                onChange={field.onChange}
                disabled={isSubmitting}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name={"description" as FieldPath<T>}
        render={({ field }) => (
          <FormItem>
            <FormLabel htmlFor={`${idPrefix}-description`}>Description</FormLabel>
            <FormControl>
              <Textarea
                {...field}
                id={`${idPrefix}-description`}
                rows={3}
                disabled={isSubmitting}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}
