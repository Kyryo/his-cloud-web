"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { PrimaryButton, SecondaryButton } from "@/components/ui/app-buttons";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { SectionedDialog } from "@/components/ui/sectioned-dialog";
import { LabCatalogProductField } from "@/features/laboratory/components/catalog/LabCatalogProductField";
import { PanelTestMembershipEditor } from "@/features/laboratory/components/catalog/PanelTestMembershipEditor";
import {
  labPanelDefaultValues,
  labPanelSchema,
  type LabPanelFormValues,
} from "@/features/laboratory/schemas/panel.schema";
import {
  createLabPanel,
  fetchLabTests,
  updateLabPanel,
} from "@/features/laboratory/services/laboratory-catalog.service";
import type {
  LabPanel,
  LabProductBrief,
  LabTestDefinition,
} from "@/features/laboratory/types/laboratory-catalog.types";
import { toLabPanelPayload } from "@/features/laboratory/utils/catalog-payloads";
import { BffError } from "@/lib/bff-client";
import { formatBffErrorMessage, mapBffErrorsToForm } from "@/lib/bff-field-errors";
import { appFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { useToast } from "@/providers/toast-provider";

const ADD_FORM_ID = "add-lab-panel-form";
const EDIT_FORM_ID = "edit-lab-panel-form";

function toFormValues(item?: LabPanel | null): LabPanelFormValues {
  if (!item) return labPanelDefaultValues;
  return {
    code: item.code,
    name: item.name,
    product_uuid: item.product_uuid ?? "",
    tests: [...(item.tests ?? [])]
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((row, index) => ({
        test_uuid: row.test_uuid,
        sort_order: row.sort_order ?? index,
      })),
  };
}

type AddLabPanelDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (item: LabPanel) => void;
  /** Preselect a billable lab product when opening from the unconfigured banner. */
  initialProduct?: LabProductBrief | null;
};

export function AddLabPanelDialog({
  open,
  onOpenChange,
  onCreated,
  initialProduct = null,
}: AddLabPanelDialogProps) {
  const { toast } = useToast();
  const form = useForm<LabPanelFormValues>({
    resolver: zodResolver(labPanelSchema),
    defaultValues: labPanelDefaultValues,
  });

  useEffect(() => {
    if (!open) return;
    form.reset({
      ...labPanelDefaultValues,
      product_uuid: initialProduct?.uuid ?? "",
      name: initialProduct?.name ?? "",
      code: initialProduct?.default_code?.trim()
        ? initialProduct.default_code.trim().slice(0, 64)
        : "",
    });
  }, [form, initialProduct, open]);

  async function handleSubmit(values: LabPanelFormValues) {
    try {
      const item = await createLabPanel(toLabPanelPayload(values));
      toast({
        variant: "success",
        title: "Panel created",
        description: `${item.name} was added to the catalog.`,
      });
      onCreated(item);
      onOpenChange(false);
    } catch (error) {
      if (error instanceof BffError) {
        const fieldErrors = mapBffErrorsToForm(error.errors);
        for (const [field, message] of Object.entries(fieldErrors)) {
          if (field in labPanelDefaultValues) {
            form.setError(field as keyof LabPanelFormValues, { message });
          }
        }
        toast({
          variant: "error",
          title: "Could not create panel",
          description: formatBffErrorMessage(error.message, error.errors),
        });
        return;
      }
      toast({
        variant: "error",
        title: "Could not create panel",
        description:
          error instanceof Error ? error.message : "Something went wrong.",
      });
    }
  }

  const isSubmitting = form.formState.isSubmitting;

  return (
    <SectionedDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Add panel"
      description="Group laboratory tests into a billable panel."
      className={cn("sm:max-w-3xl", appFont.className)}
      data-testid="add-lab-panel-dialog"
      footer={
        <>
          <SecondaryButton
            type="button"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </SecondaryButton>
          <PrimaryButton type="submit" form={ADD_FORM_ID} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                Creating...
              </>
            ) : (
              "Create"
            )}
          </PrimaryButton>
        </>
      }
    >
      <Form {...form}>
        <form
          id={ADD_FORM_ID}
          className="space-y-4"
          onSubmit={form.handleSubmit(handleSubmit)}
        >
          <PanelFields
            form={form}
            isSubmitting={isSubmitting}
            loadOptions={open}
            productBrief={initialProduct}
          />
        </form>
      </Form>
    </SectionedDialog>
  );
}

type EditLabPanelDialogProps = {
  item: LabPanel | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated: (item: LabPanel) => void;
  /** When false, identity/product only — tests are managed on the detail Tests tab. */
  includeTests?: boolean;
};

export function EditLabPanelDialog({
  item,
  open,
  onOpenChange,
  onUpdated,
  includeTests = true,
}: EditLabPanelDialogProps) {
  const { toast } = useToast();
  const form = useForm<LabPanelFormValues>({
    resolver: zodResolver(labPanelSchema),
    defaultValues: labPanelDefaultValues,
  });

  useEffect(() => {
    if (open && item) form.reset(toFormValues(item));
  }, [form, item, open]);

  async function handleSubmit(values: LabPanelFormValues) {
    if (!item) return;
    try {
      const updated = await updateLabPanel(
        item.uuid,
        toLabPanelPayload(values, { includeTests }),
      );
      toast({
        variant: "success",
        title: "Panel updated",
        description: `${updated.name} was saved.`,
      });
      onUpdated(updated);
      onOpenChange(false);
    } catch (error) {
      if (error instanceof BffError) {
        toast({
          variant: "error",
          title: "Could not update panel",
          description: formatBffErrorMessage(error.message, error.errors),
        });
        return;
      }
      toast({
        variant: "error",
        title: "Could not update panel",
        description:
          error instanceof Error ? error.message : "Something went wrong.",
      });
    }
  }

  const isSubmitting = form.formState.isSubmitting;

  return (
    <SectionedDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Edit panel"
      description={
        includeTests
          ? "Update panel membership and billing product."
          : "Update panel name, code, and billing product."
      }
      className={cn(includeTests ? "sm:max-w-3xl" : "sm:max-w-xl", appFont.className)}
      data-testid="edit-lab-panel-dialog"
      footer={
        <>
          <SecondaryButton
            type="button"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </SecondaryButton>
          <PrimaryButton type="submit" form={EDIT_FORM_ID} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                Saving...
              </>
            ) : (
              "Save"
            )}
          </PrimaryButton>
        </>
      }
    >
      <Form {...form}>
        <form
          id={EDIT_FORM_ID}
          className="space-y-4"
          onSubmit={form.handleSubmit(handleSubmit)}
        >
          <PanelFields
            form={form}
            isSubmitting={isSubmitting}
            loadOptions={open && includeTests}
            productBrief={item?.product ?? null}
            allowConfiguredUuid={item?.product_uuid ?? null}
            includeTests={includeTests}
          />
        </form>
      </Form>
    </SectionedDialog>
  );
}

function PanelFields({
  form,
  isSubmitting,
  loadOptions,
  productBrief = null,
  allowConfiguredUuid = null,
  includeTests = true,
}: {
  form: ReturnType<typeof useForm<LabPanelFormValues>>;
  isSubmitting: boolean;
  loadOptions: boolean;
  productBrief?: LabProductBrief | null;
  allowConfiguredUuid?: string | null;
  includeTests?: boolean;
}) {
  const [tests, setTests] = useState<LabTestDefinition[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const { control, setValue, watch } = form;
  const productUuid = watch("product_uuid");

  useEffect(() => {
    const handle = window.setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
    }, 250);
    return () => window.clearTimeout(handle);
  }, [searchInput]);

  useEffect(() => {
    if (!loadOptions || !includeTests) return;
    let cancelled = false;
    void (async () => {
      try {
        if (debouncedSearch) {
          setIsSearching(true);
        }
        const response = await fetchLabTests({
          pageSize: 20,
          search: debouncedSearch || undefined,
        });
        if (!cancelled) setTests(response.results);
      } catch {
        if (!cancelled) setTests([]);
      } finally {
        if (!cancelled) setIsSearching(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [debouncedSearch, includeTests, loadOptions]);

  useEffect(() => {
    if (!loadOptions) {
      setSearchInput("");
      setDebouncedSearch("");
    }
  }, [loadOptions]);

  return (
    <>
      <FormField
        control={control}
        name="code"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Code</FormLabel>
            <FormControl>
              <Input {...field} disabled={isSubmitting} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Name</FormLabel>
            <FormControl>
              <Input {...field} disabled={isSubmitting} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="product_uuid"
        render={({ fieldState }) => (
          <FormItem>
            <LabCatalogProductField
              productUuid={productUuid ?? ""}
              productBrief={productBrief}
              disabled={isSubmitting}
              invalid={Boolean(fieldState.error)}
              allowConfiguredUuid={allowConfiguredUuid}
              onChange={(uuid) => setValue("product_uuid", uuid, { shouldDirty: true })}
            />
            <FormMessage />
          </FormItem>
        )}
      />
      {includeTests ? (
        <FormField
          control={control}
          name="tests"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tests</FormLabel>
              <PanelTestMembershipEditor
                tests={tests}
                value={field.value}
                onChange={field.onChange}
                searchValue={searchInput}
                onSearchChange={setSearchInput}
                isSearching={isSearching}
                disabled={isSubmitting}
              />
              <FormMessage />
            </FormItem>
          )}
        />
      ) : null}
    </>
  );
}
