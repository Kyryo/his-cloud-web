"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronDown, Loader2, Stethoscope } from "lucide-react";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DentalNoTeethSelectedDialog } from "@/features/clinical-dental/components/DentalNoTeethSelectedDialog";
import { DentalProcedurePicker } from "@/features/clinical-dental/components/DentalProcedurePicker";
import { DentalTreatmentSurfacesDialog } from "@/features/clinical-dental/components/DentalTreatmentSurfacesDialog";
import { DentalTreatmentTeethDialog } from "@/features/clinical-dental/components/DentalTreatmentTeethDialog";
import { DENTAL_HISTORY_SECTION_IDS } from "@/features/clinical-dental/constants/dental-workspace-routing";
import {
  useDeleteDentalProcedure,
  useDentalProcedures,
  usePerformDentalProcedure,
  useUpdateDentalProcedure,
} from "@/features/clinical-dental/hooks/use-clinical-dental";
import {
  dentalTreatmentDefaultValues,
  dentalTreatmentSchema,
  toDentalTreatmentPayload,
  type DentalTreatmentFormValues,
} from "@/features/clinical-dental/schemas/dental-treatment.schema";
import type {
  DentalProcedure,
  ToothSurface,
} from "@/features/clinical-dental/types/clinical-dental.types";
import { toothName } from "@/features/clinical-dental/utils/dental-arches";
import {
  formatSurfaceLabels,
  TOOTH_SURFACES,
} from "@/features/clinical-dental/utils/dental-conditions";
import {
  OpdConsultContentPanel,
  OpdConsultFormLocked,
  OpdConsultFormPanel,
  OpdConsultLayout,
} from "@/features/clinical-opd/components/detail/OpdConsultLayout";
import { OpdEncounterTabEmptyState } from "@/features/clinical-opd/components/detail/OpdEncounterTabEmptyState";
import { OpdEncounterTabSkeleton } from "@/features/clinical-opd/components/detail/OpdEncounterTabSkeleton";
import { useOpdEncounterWorkspace } from "@/features/clinical-opd/components/detail/opd-encounter-workspace-context";
import type { ClinicalWorkspacePanelProps } from "@/features/clinical-workspace/types/clinical-workspace.types";
import { formatDisplayDate } from "@/features/customers/utils/format-customer";
import { ClaimLineOdontogramPicker } from "@/features/dental/components/ClaimLineOdontogramPicker";
import { todayDateInputValue } from "@/features/inventory/schemas/purchase-order.schema";
import { formatProductLabel } from "@/features/inventory/utils/format-inventory";
import { BffError } from "@/lib/bff-client";
import { formatBffErrorMessage, mapBffErrorsToForm } from "@/lib/bff-field-errors";
import { cn } from "@/lib/utils";
import { useToast } from "@/providers/toast-provider";

export const DENTAL_TREATMENT_FORM_ID = "dental-treatment-form";

const FORM_FIELDS = ["treatment_date", "product_uuid", "tooth_numbers", "notes"] as const;
type MappableField = (typeof FORM_FIELDS)[number];

function isMappableField(field: string): field is MappableField {
  return (FORM_FIELDS as readonly string[]).includes(field);
}

function sortedUnique(teeth: readonly number[]): number[] {
  return [...new Set(teeth)].sort((a, b) => a - b);
}

/** Record a treatment performed today or earlier; it is billed to the visit. */
export function DentalTreatmentTabPanel({
  visitUuid,
  encounterUuid,
  isActive,
}: ClinicalWorkspacePanelProps) {
  const { toast } = useToast();
  const { capabilities, isChartLocked } = useOpdEncounterWorkspace();
  const proceduresQuery = useDentalProcedures(visitUuid, encounterUuid);
  const performProcedure = usePerformDentalProcedure(visitUuid, encounterUuid);
  const [pendingWithoutTeeth, setPendingWithoutTeeth] =
    useState<DentalTreatmentFormValues | null>(null);
  const [odontogramResetToken, setOdontogramResetToken] = useState(0);

  const form = useForm<DentalTreatmentFormValues>({
    resolver: zodResolver(dentalTreatmentSchema),
    defaultValues: dentalTreatmentDefaultValues(),
  });
  const productLabel = useWatch({ control: form.control, name: "product_label" });
  const selectedTeeth = useWatch({ control: form.control, name: "tooth_numbers" });

  const canRecord =
    capabilities.includes("perform_dental_procedure") && !isChartLocked;

  if (!isActive) {
    return null;
  }

  async function saveTreatment(values: DentalTreatmentFormValues) {
    try {
      await performProcedure.mutateAsync(toDentalTreatmentPayload(values));
      toast({
        variant: "success",
        title: "Treatment saved",
        description: `${values.product_label || "The treatment"} was added to the visit bill.`,
      });
      setPendingWithoutTeeth(null);
      form.reset(dentalTreatmentDefaultValues());
      setOdontogramResetToken((token) => token + 1);
    } catch (error) {
      setPendingWithoutTeeth(null);
      if (error instanceof BffError) {
        for (const [field, message] of Object.entries(
          mapBffErrorsToForm(error.errors),
        )) {
          if (isMappableField(field)) {
            form.setError(field, { message });
          }
        }
      }
      toast({
        variant: "error",
        title: "Could not save the treatment",
        description:
          error instanceof BffError
            ? formatBffErrorMessage(error.message, error.errors)
            : "Try again in a moment.",
      });
    }
  }

  const handleSubmit = form.handleSubmit(async (values) => {
    if (values.tooth_numbers.length === 0) {
      setPendingWithoutTeeth(values);
      return;
    }
    await saveTreatment(values);
  });

  const isSaving = form.formState.isSubmitting || performProcedure.isPending;
  const procedures = proceduresQuery.data ?? [];

  const formColumn = (
    <OpdConsultFormPanel
      title="Record treatment"
      description="Treatments are added to this visit's bill when saved."
      action={
        canRecord ? (
          <Button
            type="submit"
            form={DENTAL_TREATMENT_FORM_ID}
            size="sm"
            className="h-8"
            disabled={isSaving}
            data-testid="dental-treatment-header-save"
          >
            {isSaving ? "Saving..." : "Save"}
          </Button>
        ) : null
      }
    >
      {canRecord ? (
        <Form {...form}>
          <form
            id={DENTAL_TREATMENT_FORM_ID}
            className="space-y-4"
            onSubmit={(event) => void handleSubmit(event)}
            noValidate
            data-testid="dental-treatment-form"
          >
            <FormField
              control={form.control}
              name="treatment_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Treatment date <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="date"
                      max={todayDateInputValue()}
                      data-testid="dental-treatment-date"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="product_uuid"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Treatment / procedure <span className="text-red-500">*</span>
                  </FormLabel>
                  <DentalProcedurePicker
                    value={field.value}
                    onChange={(product) => {
                      field.onChange(product.uuid);
                      form.setValue("product_label", formatProductLabel(product));
                    }}
                  />
                  {productLabel ? (
                    <p
                      className="text-xs text-brand-slate"
                      data-testid="dental-treatment-selected-product"
                    >
                      Selected: {productLabel}
                    </p>
                  ) : null}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tooth_numbers"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Odontogram</FormLabel>
                  <ClaimLineOdontogramPicker
                    value={field.value}
                    remountToken={odontogramResetToken}
                    instruction="Click the teeth treated"
                    onRequestAssign={(teeth) =>
                      field.onChange(sortedUnique([...field.value, ...teeth]))
                    }
                    onRemoveTeeth={(teeth) =>
                      field.onChange(
                        field.value.filter((tooth) => !teeth.includes(tooth)),
                      )
                    }
                    onSelectAll={(teeth) =>
                      field.onChange(sortedUnique([...field.value, ...teeth]))
                    }
                    onDeselectAll={(teeth) =>
                      field.onChange(
                        field.value.filter((tooth) => !teeth.includes(tooth)),
                      )
                    }
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            <TeethDetails teeth={selectedTeeth} />

            <FormField
              control={form.control}
              name="surfaces"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Surfaces</FormLabel>
                  <div
                    className="flex flex-wrap gap-1.5"
                    role="group"
                    aria-label="Surfaces"
                  >
                    {TOOTH_SURFACES.map((surface) => {
                      const checked = field.value.includes(surface.value);
                      return (
                        <label
                          key={surface.value}
                          className={cn(
                            "inline-flex cursor-pointer items-center gap-1.5 rounded-md border px-2 py-1 text-xs",
                            checked
                              ? "border-brand-primary bg-brand-primary/10 text-brand-navy"
                              : "border-dash-border text-brand-slate",
                          )}
                        >
                          <input
                            type="checkbox"
                            className="size-3.5 rounded border-brand-border"
                            checked={checked}
                            onChange={(event) => {
                              const next: ToothSurface[] = event.target.checked
                                ? [...field.value, surface.value]
                                : field.value.filter(
                                    (value) => value !== surface.value,
                                  );
                              field.onChange(next);
                            }}
                          />
                          {surface.label}
                        </label>
                      );
                    })}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      rows={3}
                      placeholder="Optional treatment notes"
                      data-testid="dental-treatment-notes"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

          </form>
        </Form>
      ) : (
        <OpdConsultFormLocked
          message={
            isChartLocked
              ? "This encounter is closed. Treatments are read-only."
              : "Your role can view treatments but not record them."
          }
        />
      )}
    </OpdConsultFormPanel>
  );

  const contentColumn = (
    <OpdConsultContentPanel
      title="Treatments"
      count={procedures.length}
      data-testid="dental-treatments-this-visit"
    >
      {proceduresQuery.isLoading ? (
        <OpdEncounterTabSkeleton rows={3} />
      ) : proceduresQuery.isError ? (
        <p className="text-sm text-red-700">Could not load treatments.</p>
      ) : procedures.length === 0 ? (
        <OpdEncounterTabEmptyState
          icon={Stethoscope}
          title="No treatments yet"
          description="Treatments you record on the left will show up here for this visit."
          data-testid="dental-treatments-empty-state"
        />
      ) : (
        <ul className="space-y-2">
          {procedures.map((procedure) => (
            <TreatmentListItem
              key={procedure.uuid}
              procedure={procedure}
              visitUuid={visitUuid}
              encounterUuid={encounterUuid}
              canManage={canRecord}
            />
          ))}
        </ul>
      )}
    </OpdConsultContentPanel>
  );

  return (
    <>
      <OpdConsultLayout
        wideForm
        historySection={DENTAL_HISTORY_SECTION_IDS.procedures}
        form={formColumn}
        content={contentColumn}
        data-testid="dental-treatment-tab-panel"
      />
      <DentalNoTeethSelectedDialog
        open={pendingWithoutTeeth !== null}
        isSubmitting={performProcedure.isPending}
        onOpenChange={(open) => {
          if (!open) {
            setPendingWithoutTeeth(null);
          }
        }}
        onConfirm={() => {
          if (pendingWithoutTeeth) {
            void saveTreatment(pendingWithoutTeeth);
          }
        }}
      />
    </>
  );
}

function TeethDetails({ teeth }: { teeth: readonly number[] }) {
  return (
    <section aria-label="Teeth details" data-testid="dental-treatment-teeth-details">
      <p className="text-sm font-medium text-brand-navy">Teeth details</p>
      {teeth.length === 0 ? (
        <p className="mt-1 text-xs text-brand-muted">
          No teeth selected. Select teeth on the odontogram above.
        </p>
      ) : (
        <ul className="mt-1.5 divide-y divide-dash-border/70 rounded-lg border border-dash-border/70">
          {teeth.map((tooth) => (
            <li
              key={tooth}
              className="flex items-center gap-2 px-3 py-1.5 text-xs"
              data-testid={`dental-treatment-tooth-${tooth}`}
            >
              <span className="w-7 shrink-0 font-semibold tabular-nums text-brand-navy">
                {tooth}
              </span>
              <span className="text-brand-slate">{toothName(tooth)}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function TreatmentListItem({
  procedure,
  visitUuid,
  encounterUuid,
  canManage,
}: {
  procedure: DentalProcedure;
  visitUuid: string;
  encounterUuid: string;
  canManage: boolean;
}) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [teethOpen, setTeethOpen] = useState(false);
  const [surfacesOpen, setSurfacesOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const updateProcedure = useUpdateDentalProcedure(visitUuid, encounterUuid);
  const deleteProcedure = useDeleteDentalProcedure(visitUuid, encounterUuid);

  const statusLabel = procedure.treatment_status
    ? procedure.treatment_status.replaceAll("_", " ")
    : null;
  const surfaceLabels =
    procedure.surfaces.length > 0
      ? formatSurfaceLabels(procedure.surfaces)
      : null;
  const teethValue =
    procedure.tooth_numbers.length > 0
      ? procedure.tooth_numbers
          .map((tooth) => `${tooth} · ${toothName(tooth)}`)
          .join(", ")
      : "Not recorded";
  const canEdit = Boolean(canManage && procedure.can_edit);
  const canDelete = Boolean(canManage && procedure.can_delete);
  const isUpdating = updateProcedure.isPending;
  const isDeleting = deleteProcedure.isPending;

  async function saveTeeth(toothNumbers: number[]) {
    try {
      await updateProcedure.mutateAsync({
        procedureUuid: procedure.uuid,
        payload: { tooth_numbers: toothNumbers },
      });
      setTeethOpen(false);
      toast({
        variant: "success",
        title: "Teeth updated",
      });
    } catch (error) {
      toast({
        variant: "error",
        title: "Could not update teeth",
        description:
          error instanceof BffError
            ? formatBffErrorMessage(error.message, error.errors)
            : "Try again in a moment.",
      });
    }
  }

  async function saveSurfaces(surfaces: ToothSurface[]) {
    try {
      await updateProcedure.mutateAsync({
        procedureUuid: procedure.uuid,
        payload: { surfaces },
      });
      setSurfacesOpen(false);
      toast({
        variant: "success",
        title: "Surfaces updated",
      });
    } catch (error) {
      toast({
        variant: "error",
        title: "Could not update surfaces",
        description:
          error instanceof BffError
            ? formatBffErrorMessage(error.message, error.errors)
            : "Try again in a moment.",
      });
    }
  }

  async function confirmDelete() {
    try {
      await deleteProcedure.mutateAsync(procedure.uuid);
      setDeleteOpen(false);
      toast({
        variant: "success",
        title: "Treatment deleted",
        description: `${procedure.procedure_name} was removed from this visit.`,
      });
    } catch (error) {
      toast({
        variant: "error",
        title: "Could not delete treatment",
        description:
          error instanceof BffError
            ? formatBffErrorMessage(error.message, error.errors)
            : "Try again in a moment.",
      });
    }
  }

  return (
    <li data-testid={`dental-treatment-item-${procedure.uuid}`}>
      <Collapsible open={open} onOpenChange={setOpen}>
        <div
          className={cn(
            "overflow-hidden rounded-xl border border-dash-border/80 bg-white shadow-2xs transition-shadow",
            open && "shadow-sm ring-1 ring-dash-border/60",
          )}
        >
          <CollapsibleTrigger
            className="flex w-full items-start gap-3 px-3.5 py-3 text-left transition-colors hover:bg-slate-50/80"
            data-testid={`dental-treatment-toggle-${procedure.uuid}`}
          >
            <div className="min-w-0 flex-1 space-y-1">
              <p className="truncate text-sm font-semibold text-brand-navy">
                {procedure.procedure_name}
              </p>
              <p className="truncate text-[11px] text-brand-muted">
                {formatDisplayDate(`${procedure.treatment_date}T00:00:00`)}
                {procedure.performed_by_name
                  ? ` · ${procedure.performed_by_name}`
                  : null}
              </p>
            </div>
            <ChevronDown
              className={cn(
                "mt-0.5 size-4 shrink-0 text-brand-muted transition-transform duration-200",
                open && "rotate-180",
              )}
              aria-hidden="true"
            />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div
              className="space-y-3 border-t border-dash-border/70 bg-slate-50/50 px-3.5 py-3"
              data-testid={`dental-treatment-details-${procedure.uuid}`}
            >
              <dl className="space-y-2.5">
                <div className="grid grid-cols-[5.5rem_minmax(0,1fr)] items-center gap-2">
                  <dt className="text-[11px] font-medium uppercase tracking-wide text-brand-muted">
                    Status
                  </dt>
                  <dd>
                    {statusLabel ? (
                      <span
                        className="inline-flex rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium capitalize text-brand-slate"
                        data-testid={`dental-treatment-status-${procedure.uuid}`}
                      >
                        {statusLabel}
                      </span>
                    ) : (
                      <span className="text-xs text-brand-muted">—</span>
                    )}
                  </dd>
                </div>

                <DetailRow
                  label="Teeth"
                  value={teethValue}
                  editable={canEdit}
                  onEdit={() => setTeethOpen(true)}
                  editTestId={`dental-treatment-edit-teeth-${procedure.uuid}`}
                />
                <DetailRow
                  label="Surfaces"
                  value={surfaceLabels || "Not recorded"}
                  editable={canEdit}
                  onEdit={() => setSurfacesOpen(true)}
                  editTestId={`dental-treatment-edit-surfaces-${procedure.uuid}`}
                />
                {procedure.actual_cost ? (
                  <DetailRow label="Billed" value={procedure.actual_cost} />
                ) : null}
                {procedure.provider_name ? (
                  <DetailRow label="Provider" value={procedure.provider_name} />
                ) : null}
                {procedure.diagnosis ? (
                  <DetailRow label="Diagnosis" value={procedure.diagnosis} />
                ) : null}
                {procedure.materials_used ? (
                  <DetailRow label="Materials" value={procedure.materials_used} />
                ) : null}
                {procedure.notes ? (
                  <DetailRow label="Notes" value={procedure.notes} />
                ) : null}
                {procedure.procedure_code ? (
                  <DetailRow label="Code" value={procedure.procedure_code} />
                ) : null}
              </dl>

              {canDelete ? (
                <div className="flex items-center justify-end border-t border-dash-border/70 pt-2.5">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                    onClick={() => setDeleteOpen(true)}
                    data-testid={`dental-treatment-delete-${procedure.uuid}`}
                  >
                    Delete
                  </Button>
                </div>
              ) : null}
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>

      <DentalTreatmentTeethDialog
        open={teethOpen}
        toothNumbers={procedure.tooth_numbers}
        isSaving={isUpdating}
        onOpenChange={setTeethOpen}
        onSave={(toothNumbers) => void saveTeeth(toothNumbers)}
      />
      <DentalTreatmentSurfacesDialog
        open={surfacesOpen}
        surfaces={procedure.surfaces}
        isSaving={isUpdating}
        onOpenChange={setSurfacesOpen}
        onSave={(surfaces) => void saveSurfaces(surfaces)}
      />
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent
          className="sm:max-w-md"
          data-testid={`dental-treatment-delete-dialog-${procedure.uuid}`}
        >
          <DialogHeader>
            <DialogTitle>Delete treatment?</DialogTitle>
            <DialogDescription>
              This removes {procedure.procedure_name} from the visit and cancels
              its bill line. You can only do this while the visit is active and
              not invoiced.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={isDeleting}
              onClick={() => setDeleteOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={isDeleting}
              className="bg-rose-600 hover:bg-rose-700 focus-visible:ring-rose-600"
              onClick={() => void confirmDelete()}
              data-testid={`dental-treatment-delete-confirm-${procedure.uuid}`}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  Deleting…
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </li>
  );
}

function DetailRow({
  label,
  value,
  editable = false,
  onEdit,
  editTestId,
}: {
  label: string;
  value: string;
  editable?: boolean;
  onEdit?: () => void;
  editTestId?: string;
}) {
  return (
    <div className="grid grid-cols-[5.5rem_minmax(0,1fr)] gap-2">
      <dt className="text-[11px] font-medium uppercase tracking-wide text-brand-muted">
        {label}
      </dt>
      <dd className="flex min-w-0 items-start justify-between gap-2">
        <span className="whitespace-pre-wrap text-xs leading-relaxed text-brand-slate">
          {value}
        </span>
        {editable && onEdit ? (
          <button
            type="button"
            onClick={onEdit}
            className="shrink-0 text-[11px] font-medium text-brand-muted transition-colors hover:text-brand-primary"
            data-testid={editTestId}
          >
            Edit
          </button>
        ) : null}
      </dd>
    </div>
  );
}
