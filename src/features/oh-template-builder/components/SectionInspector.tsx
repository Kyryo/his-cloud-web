"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Archive, Layers, Unlink } from "lucide-react";
import { useForm } from "react-hook-form";

import { PrimaryButton } from "@/components/ui/app-buttons";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RequiredFieldMarker } from "@/components/ui/required-field-marker";
import { Switch } from "@/components/ui/switch";
import { ConfirmActionButton } from "@/features/oh-template-builder/components/ConfirmActionButton";
import {
  InspectorShell,
  InspectorToggleRow,
} from "@/features/oh-template-builder/components/InspectorShell";
import { SelectionModeToggle } from "@/features/oh-template-builder/components/SelectionModeToggle";
import { useTemplateBuilder } from "@/features/oh-template-builder/hooks/useTemplateBuilder";
import {
  sectionFormSchema,
  type SectionFormValues,
} from "@/features/oh-template-builder/template-builder.schema";
import type {
  BuilderAttachment,
  BuilderSection,
} from "@/features/oh-template-builder/template-builder.types";

type SectionInspectorProps = {
  attachment: BuilderAttachment;
  section: BuilderSection;
};

export function SectionInspector({ attachment, section }: SectionInspectorProps) {
  const { updateSection, detachSection, archiveSection, isPending } =
    useTemplateBuilder();
  const form = useForm<SectionFormValues>({
    resolver: zodResolver(sectionFormSchema),
    values: {
      name: section.name,
      isMandatory: section.isMandatory,
      selectionMode: section.selectionMode,
    },
  });
  const isSaving = isPending(`section:update:${section.uuid}`);
  const isRemoving =
    isPending(`section:detach:${attachment.uuid}`) ||
    isPending(`section:archive:${section.uuid}`);

  async function onSubmit(values: SectionFormValues) {
    await updateSection(section.uuid, values);
  }

  return (
    <Form {...form}>
      <form
        className="h-full"
        onSubmit={form.handleSubmit((values) => void onSubmit(values))}
      >
        <InspectorShell
          eyebrow={
            <span className="inline-flex items-center gap-1.5">
              <Layers className="size-3.5" aria-hidden />
              Section
            </span>
          }
          title={section.name}
          footer={
            <>
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={isRemoving}
                  onClick={() => void detachSection(attachment)}
                  className="gap-1.5 text-brand-muted hover:text-brand-navy"
                >
                  <Unlink className="size-3.5" aria-hidden />
                  Remove
                </Button>
                {section.isSystem ? null : (
                  <ConfirmActionButton
                    confirmLabel="Archive everywhere"
                    disabled={isRemoving}
                    onConfirm={() => archiveSection(attachment)}
                  >
                    <Archive className="size-3.5" aria-hidden />
                    Archive
                  </ConfirmActionButton>
                )}
              </div>
              <PrimaryButton
                type="submit"
                size="sm"
                disabled={isSaving || !form.formState.isDirty}
              >
                {isSaving ? "Saving" : "Save"}
              </PrimaryButton>
            </>
          }
        >
          <div className="space-y-5">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Name <RequiredFieldMarker />
                  </FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <Label htmlFor="oh-section-code">Code</Label>
              <Input
                id="oh-section-code"
                value={section.code}
                disabled
                className="font-mono text-[13px]"
              />
              <p className="text-xs text-dash-muted">
                Fixed once created. Programmes refer to sections by code.
              </p>
            </div>

            <FormField
              control={form.control}
              name="selectionMode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>How staff choose</FormLabel>
                  <SelectionModeToggle value={field.value} onChange={field.onChange} />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isMandatory"
              render={({ field }) => (
                <InspectorToggleRow
                  title="Required section"
                  description="Must be completed before the form can be submitted."
                  control={
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      aria-label="Required section"
                    />
                  }
                />
              )}
            />

            <p className="rounded-xl bg-slate-50 px-4 py-3 text-xs leading-5 text-brand-slate">
              {section.isSystem
                ? "System section. It backs programme requirements, so it can be renamed but not archived."
                : "Shared library section. Changes here apply to every template that uses it."}
            </p>
          </div>
        </InspectorShell>
      </form>
    </Form>
  );
}
