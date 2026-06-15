"use client";

import { useState } from "react";
import type { Control } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { TherapyRichTextEditor } from "@/features/therapy/components/TherapyRichTextEditor";
import type { TherapySessionFormValues } from "@/features/therapy/schemas/therapy-session.schema";

const NOTE_FIELDS = [
  {
    name: "subjective_complaint",
    label: "Subjective complaint",
    placeholder: "Record what the client or caregiver reports...",
  },
  {
    name: "objective_findings",
    label: "Objective findings",
    placeholder: "Record observations, measurements, and clinical findings...",
  },
  {
    name: "assessment_notes",
    label: "Assessment",
    placeholder: "Summarize clinical interpretation and progress...",
  },
  {
    name: "plan_for_next_session",
    label: "Plan for next session",
    placeholder: "Document planned interventions and follow-up...",
  },
] as const;

export function SessionClinicalNotesFields({
  control,
  disabled,
}: {
  control: Control<TherapySessionFormValues>;
  disabled: boolean;
}) {
  const [activeField, setActiveField] =
    useState<(typeof NOTE_FIELDS)[number]["name"]>("subjective_complaint");
  const selectedField =
    NOTE_FIELDS.find((field) => field.name === activeField) ?? NOTE_FIELDS[0];

  return (
    <div className="bg-white">
      <div
        className="flex flex-wrap gap-x-6 border-b border-brand-border"
        role="tablist"
        aria-label="Session clinical notes"
      >
        {NOTE_FIELDS.map((noteField) => (
          <Button
            key={noteField.name}
            type="button"
            variant="ghost"
            role="tab"
            aria-selected={activeField === noteField.name}
            className={
              activeField === noteField.name
                ? "rounded-none border-b-2 border-brand-primary px-0 text-brand-primary hover:bg-transparent"
                : "rounded-none px-0 text-brand-muted hover:bg-transparent hover:text-brand-navy"
            }
            onClick={() => setActiveField(noteField.name)}
          >
            {noteField.label}
          </Button>
        ))}
      </div>

      <FormField
        key={selectedField.name}
        control={control}
        name={selectedField.name}
        render={({ field }) => (
          <FormItem className="pt-6">
            <FormControl>
              <TherapyRichTextEditor
                value={field.value ?? ""}
                onChange={field.onChange}
                placeholder={selectedField.placeholder}
                disabled={disabled}
                className="w-full"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
