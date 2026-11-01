"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Library, Plus, Search, Sparkles } from "lucide-react";
import { useDeferredValue, useState } from "react";
import { useForm } from "react-hook-form";

import { PrimaryButton, SecondaryButton } from "@/components/ui/app-buttons";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { InspectorToggleRow } from "@/features/oh-template-builder/components/InspectorShell";
import { SelectionModeToggle } from "@/features/oh-template-builder/components/SelectionModeToggle";
import { useTemplateBuilder } from "@/features/oh-template-builder/hooks/useTemplateBuilder";
import { toSectionCode } from "@/features/oh-template-builder/lib/templateCodes";
import {
  newSectionFormSchema,
  type NewSectionFormInput,
  type NewSectionFormValues,
} from "@/features/oh-template-builder/template-builder.schema";
import type { BuilderSection } from "@/features/oh-template-builder/template-builder.types";
import { appFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";

type AddSectionDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type Mode = "library" | "new";

export function AddSectionDialog({ open, onOpenChange }: AddSectionDialogProps) {
  const { library, attachments } = useTemplateBuilder();
  const attachedUuids = new Set(attachments.map((row) => row.sectionUuid));
  const available = library.filter((section) => !attachedUuids.has(section.uuid));
  const [mode, setMode] = useState<Mode>(available.length > 0 ? "library" : "new");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          appFont.className,
          "flex max-h-[85vh] w-full max-w-lg flex-col gap-0 overflow-hidden p-0",
        )}
      >
        <DialogHeader className="space-y-1 px-6 pb-4 pt-6 text-left">
          <DialogTitle>Add a section</DialogTitle>
          <DialogDescription>
            Reuse a shared section or create a new one for the library.
          </DialogDescription>
        </DialogHeader>

        <div className="px-6">
          <div role="tablist" className="grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1">
            {(
              [
                { id: "library", label: `From library (${available.length})`, icon: Library },
                { id: "new", label: "Create new", icon: Sparkles },
              ] as const
            ).map((tab) => {
              const Icon = tab.icon;
              const selected = mode === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => setMode(tab.id)}
                  className={cn(
                    "flex items-center justify-center gap-1.5 rounded-lg py-2 text-sm transition-colors",
                    selected
                      ? "bg-white font-medium text-brand-navy shadow-[0_1px_2px_rgb(15_23_42/0.08)]"
                      : "text-brand-muted hover:text-brand-navy",
                  )}
                >
                  <Icon className="size-3.5" aria-hidden />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {mode === "library" ? (
          <LibraryPicker sections={available} onDone={() => onOpenChange(false)} />
        ) : (
          <NewSectionForm onDone={() => onOpenChange(false)} />
        )}
      </DialogContent>
    </Dialog>
  );
}

function LibraryPicker({
  sections,
  onDone,
}: {
  sections: BuilderSection[];
  onDone: () => void;
}) {
  const { attachSection, isPending } = useTemplateBuilder();
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query.trim().toLowerCase());
  const matches = deferredQuery
    ? sections.filter(
        (section) =>
          section.name.toLowerCase().includes(deferredQuery) ||
          section.code.toLowerCase().includes(deferredQuery),
      )
    : sections;

  async function add(section: BuilderSection) {
    const attached = await attachSection(section.uuid);
    if (attached) {
      onDone();
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col px-6 pb-6 pt-4">
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
          aria-hidden
        />
        <Input
          autoFocus
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search sections"
          aria-label="Search shared sections"
          className="pl-9"
        />
      </div>
      <ul className="mt-3 min-h-0 flex-1 space-y-1 overflow-y-auto">
        {matches.length === 0 ? (
          <li className="px-2 py-8 text-center text-sm text-dash-muted">
            {sections.length === 0
              ? "Every shared section is already on this template."
              : "No sections match that search."}
          </li>
        ) : (
          matches.map((section) => {
            const busy = isPending(`section:attach:${section.uuid}`);
            return (
              <li key={section.uuid}>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void add(section)}
                  className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-brand-tint/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/30 disabled:opacity-60"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-brand-navy">
                      {section.name}
                    </span>
                    <span className="mt-0.5 block truncate text-xs text-dash-muted">
                      <span className="font-mono">{section.code}</span>
                      {section.isMandatory ? ", required" : ""}
                      {section.selectionMode === "exclusive" ? ", pick one" : ", pick any"}
                    </span>
                  </span>
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full text-brand-primary opacity-0 transition-opacity group-hover:bg-white group-hover:opacity-100 group-focus-visible:opacity-100">
                    <Plus className="size-4" aria-hidden />
                  </span>
                </button>
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
}

function NewSectionForm({ onDone }: { onDone: () => void }) {
  const { createSection, isPending } = useTemplateBuilder();
  const form = useForm<NewSectionFormInput, unknown, NewSectionFormValues>({
    resolver: zodResolver(newSectionFormSchema),
    defaultValues: {
      name: "",
      code: "",
      isMandatory: false,
      selectionMode: "inclusive",
    },
  });
  const isSaving = isPending("section:create");

  async function onSubmit(values: NewSectionFormValues) {
    const created = await createSection(values);
    if (created) {
      onDone();
    }
  }

  return (
    <Form {...form}>
      <form
        className="flex min-h-0 flex-1 flex-col"
        onSubmit={form.handleSubmit((values) => void onSubmit(values))}
      >
        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 pb-2 pt-5">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Name <RequiredFieldMarker />
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    autoFocus
                    placeholder="Vital signs"
                    onChange={(event) => {
                      field.onChange(event);
                      if (!form.getFieldState("code").isDirty) {
                        form.setValue("code", toSectionCode(event.target.value));
                      }
                    }}
                  />
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
                    placeholder="vital_signs"
                    className="font-mono text-[13px]"
                    onChange={(event) =>
                      form.setValue("code", event.target.value, { shouldDirty: true })
                    }
                  />
                </FormControl>
                <FormDescription>Filled in from the name. Fixed after creation.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
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
        </div>
        <div className="flex justify-end gap-2 border-t border-dash-border px-6 py-4">
          <SecondaryButton type="button" onClick={onDone} disabled={isSaving}>
            Cancel
          </SecondaryButton>
          <PrimaryButton type="submit" disabled={isSaving}>
            {isSaving ? "Creating" : "Create and add"}
          </PrimaryButton>
        </div>
      </form>
    </Form>
  );
}
