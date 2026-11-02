"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Search } from "lucide-react";
import { useDeferredValue, useState } from "react";
import { useForm, useWatch } from "react-hook-form";

import { PrimaryButton } from "@/components/ui/app-buttons";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RequiredFieldMarker } from "@/components/ui/required-field-marker";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import {
  interactionFromSection,
  sectionModesFromInteraction,
  type SectionInteractionMode,
} from "@/features/oh-template-builder/components/SelectionModeToggle";
import { useTemplateBuilder } from "@/features/oh-template-builder/hooks/useTemplateBuilder";
import { toSectionCode } from "@/features/oh-template-builder/lib/templateCodes";
import {
  newSectionFormSchema,
  type NewSectionFormInput,
  type NewSectionFormValues,
} from "@/features/oh-template-builder/template-builder.schema";
import type { BuilderSection } from "@/features/oh-template-builder/template-builder.types";
import { defaultResponseFields } from "@/features/settings/components/modules/occupational-health/template-library/responseConfig";
import { appFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";

export type AddSectionTab = "library" | "new";

const ANSWER_MODES: Array<{
  id: SectionInteractionMode;
  label: string;
  hint: string;
}> = [
  { id: "exclusive", label: "Pick one", hint: "Staff choose a single item" },
  { id: "inclusive", label: "Pick any", hint: "Staff tick any number of items" },
  { id: "direct", label: "Enter values", hint: "Staff type into fields you set up afterwards" },
];

type AddSectionSheetProps = {
  open: boolean;
  initialTab: AddSectionTab;
  initialInteraction?: SectionInteractionMode;
  onOpenChange: (open: boolean) => void;
};

export function AddSectionSheet({
  open,
  initialTab,
  initialInteraction = "inclusive",
  onOpenChange,
}: AddSectionSheetProps) {
  const { library, attachments } = useTemplateBuilder();
  const attachedUuids = new Set(attachments.map((row) => row.sectionUuid));
  const available = library.filter((section) => !attachedUuids.has(section.uuid));
  const [tab, setTab] = useState<AddSectionTab>(
    initialTab === "library" && available.length === 0 ? "new" : initialTab,
  );
  const close = () => onOpenChange(false);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className={cn(
          appFont.className,
          "flex w-full flex-col gap-0 p-0 sm:max-w-[420px]",
        )}
      >
        <div className="px-5 pb-0 pt-5">
          <SheetTitle className="text-base font-semibold text-brand-navy">Add section</SheetTitle>
          <SheetDescription className="mt-0.5 text-[13px] text-dash-muted">
            Sections are shared, so edits apply to every template that uses them.
          </SheetDescription>
          <div role="tablist" aria-label="Add section" className="mt-4 flex gap-5 border-b border-dash-border">
            <TabButton selected={tab === "library"} onClick={() => setTab("library")}>
              From library
              <span className="ml-1.5 rounded bg-slate-100 px-1.5 text-[11px] tabular-nums text-brand-slate">
                {available.length}
              </span>
            </TabButton>
            <TabButton selected={tab === "new"} onClick={() => setTab("new")}>
              New section
            </TabButton>
          </div>
        </div>

        {tab === "library" ? (
          <LibraryPicker
            sections={available}
            onDone={close}
            onCreateNew={() => setTab("new")}
          />
        ) : (
          <NewSectionForm onDone={close} initialInteraction={initialInteraction} />
        )}
      </SheetContent>
    </Sheet>
  );
}

function TabButton({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={selected}
      onClick={onClick}
      className={cn(
        "-mb-px flex h-9 items-center border-b-2 text-[13px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/30",
        selected
          ? "border-brand-primary font-medium text-brand-navy"
          : "border-transparent text-dash-muted hover:text-brand-navy",
      )}
    >
      {children}
    </button>
  );
}

function LibraryPicker({
  sections,
  onDone,
  onCreateNew,
}: {
  sections: BuilderSection[];
  onDone: () => void;
  onCreateNew: () => void;
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
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="px-5 pt-4">
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-dash-muted"
            aria-hidden
          />
          <Input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by name or code"
            aria-label="Search shared sections"
            className="h-9 pl-8 text-[13px]"
          />
        </div>
      </div>

      <ul className="mt-2 min-h-0 flex-1 overflow-y-auto px-3 pb-4">
        {matches.length === 0 ? (
          <li className="px-2 py-10 text-center">
            <p className="text-[13px] text-dash-muted">
              {sections.length === 0
                ? "Every shared section is already on this template."
                : "No sections match that search."}
            </p>
            <button
              type="button"
              onClick={onCreateNew}
              className="mt-2 text-[13px] font-medium text-brand-primary hover:underline"
            >
              Create a new section
            </button>
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
                  className="flex w-full items-baseline gap-3 border-b border-dash-border px-2 py-2.5 text-left transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/30 disabled:opacity-60"
                >
                  <span className="min-w-0 flex-1 truncate text-[13.5px] text-brand-navy">
                    {section.name}
                  </span>
                  {section.isMandatory ? (
                    <span className="shrink-0 text-[11px] text-brand-primary">Required</span>
                  ) : null}
                  <span className="shrink-0 font-mono text-[11px] text-dash-muted">
                    {section.code}
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

function NewSectionForm({
  onDone,
  initialInteraction,
}: {
  onDone: () => void;
  initialInteraction: SectionInteractionMode;
}) {
  const { createSection, isPending } = useTemplateBuilder();
  const [isEditingCode, setIsEditingCode] = useState(false);
  const initialModes = sectionModesFromInteraction(initialInteraction);
  const form = useForm<NewSectionFormInput, unknown, NewSectionFormValues>({
    resolver: zodResolver(newSectionFormSchema),
    defaultValues: {
      name: "",
      code: "",
      isMandatory: false,
      selectionMode: initialModes.selectionMode,
      contentMode: initialModes.contentMode,
      defaultResponseFields: initialInteraction === "direct" ? defaultResponseFields("text") : [],
    },
  });
  const isSaving = isPending("section:create");
  const [code, contentMode, selectionMode] = useWatch({
    control: form.control,
    name: ["code", "contentMode", "selectionMode"],
  });
  const interaction = interactionFromSection({ contentMode, selectionMode });

  function setInteraction(mode: SectionInteractionMode) {
    const next = sectionModesFromInteraction(mode);
    form.setValue("contentMode", next.contentMode, { shouldDirty: true });
    form.setValue("selectionMode", next.selectionMode, { shouldDirty: true });
    form.setValue(
      "defaultResponseFields",
      mode === "direct" ? defaultResponseFields("text") : [],
      { shouldDirty: true },
    );
  }

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
        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 pt-5">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <FormLabel className="text-[13px]">
                  Name <RequiredFieldMarker />
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    autoFocus
                    placeholder="e.g. Vital signs"
                    className="h-9 text-[13.5px]"
                    onChange={(event) => {
                      field.onChange(event);
                      if (!form.getFieldState("code").isDirty) {
                        form.setValue("code", toSectionCode(event.target.value));
                      }
                    }}
                  />
                </FormControl>
                <FormMessage />
                {isEditingCode ? null : (
                  <p className="flex items-center gap-1.5 text-[12px] text-dash-muted">
                    Code
                    <span className="font-mono text-brand-slate">{code || "auto"}</span>
                    <button
                      type="button"
                      onClick={() => setIsEditingCode(true)}
                      className="text-brand-primary hover:underline"
                    >
                      Change
                    </button>
                  </p>
                )}
              </FormItem>
            )}
          />

          {isEditingCode ? (
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-[13px]">
                    Code <RequiredFieldMarker />
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="vital_signs"
                      className="h-9 font-mono text-[13px]"
                      onChange={(event) =>
                        form.setValue("code", event.target.value, { shouldDirty: true })
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ) : null}

          <fieldset>
            <legend className="mb-2 text-[13px] font-medium text-brand-navy">
              How staff answer
            </legend>
            <div
              role="radiogroup"
              aria-label="How staff answer"
              className="divide-y divide-dash-border overflow-hidden rounded-lg border border-dash-border"
            >
              {ANSWER_MODES.map((option) => {
                const selected = interaction === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => setInteraction(option.id)}
                    className={cn(
                      "flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-primary/30",
                      selected ? "bg-brand-tint/50" : "hover:bg-slate-50",
                    )}
                  >
                    <span
                      aria-hidden
                      className={cn(
                        "flex size-4 shrink-0 items-center justify-center rounded-full border",
                        selected ? "border-brand-primary" : "border-slate-300",
                      )}
                    >
                      {selected ? <span className="size-2 rounded-full bg-brand-primary" /> : null}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[13px] font-medium text-brand-navy">
                        {option.label}
                      </span>
                      <span className="block text-[12px] text-dash-muted">{option.hint}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </fieldset>

          <FormField
            control={form.control}
            name="isMandatory"
            render={({ field }) => (
              <label className="flex cursor-pointer items-center justify-between gap-4 border-t border-dash-border pt-4">
                <span>
                  <span className="block text-[13px] font-medium text-brand-navy">Required</span>
                  <span className="block text-[12px] text-dash-muted">
                    Must be completed before the form is submitted.
                  </span>
                </span>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  aria-label="Required section"
                />
              </label>
            )}
          />
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-dash-border px-5 py-3">
          <button
            type="button"
            onClick={onDone}
            disabled={isSaving}
            className="h-9 rounded-md px-3 text-[13px] text-brand-slate hover:bg-slate-100"
          >
            Cancel
          </button>
          <PrimaryButton type="submit" disabled={isSaving} className="h-9 text-[13px]">
            {isSaving ? "Adding" : "Add section"}
          </PrimaryButton>
        </div>
      </form>
    </Form>
  );
}
