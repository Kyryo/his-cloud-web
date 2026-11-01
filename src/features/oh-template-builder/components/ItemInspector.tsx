"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Archive, ChevronLeft, Diamond } from "lucide-react";
import { useForm } from "react-hook-form";

import { PrimaryButton } from "@/components/ui/app-buttons";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RequiredFieldMarker } from "@/components/ui/required-field-marker";
import { Switch } from "@/components/ui/switch";
import { ConfirmActionButton } from "@/features/oh-template-builder/components/ConfirmActionButton";
import {
  InspectorShell,
  InspectorToggleRow,
} from "@/features/oh-template-builder/components/InspectorShell";
import {
  ItemResponsesEditor,
  ItemScheduleEditor,
} from "@/features/oh-template-builder/components/ItemListEditors";
import { useTemplateBuilder } from "@/features/oh-template-builder/hooks/useTemplateBuilder";
import { toUpperCode } from "@/features/oh-template-builder/lib/templateCodes";
import {
  itemFormSchema,
  type ItemFormInput,
  type ItemFormValues,
} from "@/features/oh-template-builder/template-builder.schema";
import type {
  BuilderAttachment,
  BuilderItem,
} from "@/features/oh-template-builder/template-builder.types";

type ItemInspectorProps = {
  attachment: BuilderAttachment;
  item: BuilderItem;
};

export function ItemInspector({ attachment, item }: ItemInspectorProps) {
  const { updateItem, archiveItem, isPending, select } = useTemplateBuilder();
  const form = useForm<ItemFormInput, unknown, ItemFormValues>({
    resolver: zodResolver(itemFormSchema),
    values: {
      name: item.name === item.code ? "" : item.name,
      code: item.code,
      isMandatory: item.isMandatory,
      schedule: item.schedule.map((row) => ({
        interval: row.interval,
        unit: row.unit,
        notes: row.notes ?? "",
      })),
      responses: item.responses.map((row) => ({ label: row.label, code: row.code })),
    },
  });
  const isSaving = isPending(`item:update:${item.uuid}`);
  const isArchiving = isPending(`item:archive:${item.uuid}`);
  const sectionName = attachment.section?.name ?? "Section";

  async function onSubmit(values: ItemFormValues) {
    await updateItem(attachment.sectionUuid, item, values);
  }

  async function onArchive() {
    const archived = await archiveItem(attachment.sectionUuid, item);
    if (archived) {
      select({ type: "section", attachmentUuid: attachment.uuid });
    }
  }

  return (
    <Form {...form}>
      <form
        className="h-full"
        onSubmit={form.handleSubmit((values) => void onSubmit(values))}
      >
        <InspectorShell
          eyebrow={
            <button
              type="button"
              onClick={() => select({ type: "section", attachmentUuid: attachment.uuid })}
              className="inline-flex max-w-full items-center gap-1 truncate rounded text-dash-muted transition-colors hover:text-brand-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/30"
            >
              <ChevronLeft className="size-3.5 shrink-0" aria-hidden />
              <span className="truncate">{sectionName}</span>
              <span aria-hidden>/</span>
              <Diamond className="size-3 shrink-0" aria-hidden />
              Item
            </button>
          }
          title={item.name}
          footer={
            <>
              <ConfirmActionButton
                confirmLabel="Archive item"
                disabled={isArchiving}
                onConfirm={onArchive}
              >
                <Archive className="size-3.5" aria-hidden />
                Archive
              </ConfirmActionButton>
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
                  <FormLabel>Display name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Shown to clinicians" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Code <RequiredFieldMarker />
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      onBlur={(event) => {
                        field.onChange(toUpperCode(event.target.value));
                        field.onBlur();
                      }}
                      className="font-mono text-[13px]"
                    />
                  </FormControl>
                  <FormDescription>
                    Programmes require items by code. Changing it can break
                    published requirements.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="isMandatory"
              render={({ field }) => (
                <InspectorToggleRow
                  title="Required item"
                  description="Must be recorded whenever this section is completed."
                  control={
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      aria-label="Required item"
                    />
                  }
                />
              )}
            />
            <ItemResponsesEditor />
            <ItemScheduleEditor />
          </div>
        </InspectorShell>
      </form>
    </Form>
  );
}
