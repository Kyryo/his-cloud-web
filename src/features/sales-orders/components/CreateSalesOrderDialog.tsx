"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { PrimaryButton, SecondaryButton } from "@/components/ui/app-buttons";
import { TabbedDialog } from "@/components/ui/tabbed-dialog";
import { CustomerAppointmentPicker } from "@/features/customers/components/CustomerAppointmentPicker";
import type { Customer } from "@/features/customers/types/customer.types";
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
import { SalesOrderPricelistPicker } from "@/features/sales-orders/components/SalesOrderPricelistPicker";
import { SalesOrderVisitPicker } from "@/features/sales-orders/components/SalesOrderVisitPicker";
import {
  createSalesOrderDefaultValues,
  createSalesOrderSchema,
  toCreateSalesOrderPayload,
  type CreateSalesOrderFormValues,
} from "@/features/sales-orders/schemas/create-sales-order.schema";
import { createSalesOrder } from "@/features/sales-orders/services/sales-orders.service";
import type { SalesOrder } from "@/features/sales-orders/types/sales-order.types";
import { resolveVisitPricelist } from "@/features/sales-orders/utils/resolve-visit-pricelist";
import type { OrganizationPricelist } from "@/features/settings/types/settings.types";
import type { VisitDetail } from "@/features/visits/types/visit.types";
import { BffError } from "@/lib/bff-client";
import { formatBffErrorMessage, mapBffErrorsToForm } from "@/lib/bff-field-errors";
import { appFont } from "@/lib/fonts";
import { useUser } from "@/providers/user-provider";
import { useToast } from "@/providers/toast-provider";

type CreateSalesOrderDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (order: SalesOrder) => void;
};

type CreateSalesOrderTab = "general" | "visit";

const TABS = [
  { id: "general" as const, label: "General" },
  { id: "visit" as const, label: "Visit", disabled: true },
];

export function CreateSalesOrderDialog({
  open,
  onOpenChange,
  onCreated,
}: CreateSalesOrderDialogProps) {
  const { toast } = useToast();
  const { userData } = useUser();
  const [activeTab, setActiveTab] = useState<CreateSalesOrderTab>("general");
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [visit, setVisit] = useState<VisitDetail | null>(null);
  const [pricelist, setPricelist] = useState<OrganizationPricelist | null>(null);
  const [isResolvingVisitPricelist, setIsResolvingVisitPricelist] = useState(false);
  const form = useForm<CreateSalesOrderFormValues>({
    resolver: zodResolver(createSalesOrderSchema),
    defaultValues: createSalesOrderDefaultValues,
  });

  const hasCustomer = Boolean(customer);
  const tabs = TABS.map((tab) =>
    tab.id === "visit" ? { ...tab, disabled: !hasCustomer } : tab,
  );
  const isSubmitting = form.formState.isSubmitting;
  const isBusy = isSubmitting || isResolvingVisitPricelist;

  function resetDialog() {
    setActiveTab("general");
    setCustomer(null);
    setVisit(null);
    setPricelist(null);
    setIsResolvingVisitPricelist(false);
    form.reset(createSalesOrderDefaultValues);
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      resetDialog();
    }
    onOpenChange(nextOpen);
  }

  useEffect(() => {
    if (!visit) {
      return;
    }

    let cancelled = false;

    void (async () => {
      setIsResolvingVisitPricelist(true);
      try {
        const resolvedPricelist = await resolveVisitPricelist(visit);
        if (!cancelled) {
          setPricelist(resolvedPricelist);
        }
      } catch {
        if (!cancelled) {
          setPricelist(null);
        }
      } finally {
        if (!cancelled) {
          setIsResolvingVisitPricelist(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [visit]);

  function handleCustomerChange(nextCustomer: Customer | null) {
    setCustomer(nextCustomer);
    setVisit(null);
    setPricelist(null);
    if (!nextCustomer && activeTab === "visit") {
      setActiveTab("general");
    }
  }

  function handleVisitChange(nextVisit: VisitDetail | null) {
    setVisit(nextVisit);
    if (!nextVisit) {
      setPricelist(null);
    }
  }

  async function handleSubmit(values: CreateSalesOrderFormValues) {
    if (!customer) {
      toast({
        variant: "error",
        title: "Client required",
        description: "Select a client before creating the sales order.",
      });
      setActiveTab("general");
      return;
    }

    try {
      const order = await createSalesOrder(
        toCreateSalesOrderPayload({
          customerId: customer.id,
          clinicId: visit ? null : userData?.primary_clinic?.id ?? null,
          clinicName: visit ? null : userData?.primary_clinic?.name ?? null,
          visitId: visit?.id ?? null,
          pricelistId: pricelist?.id ?? null,
          values,
        }),
      );
      toast({
        variant: "success",
        title: "Sales order created",
        description: `${order.name || "Order"} is ready for line items.`,
      });
      onCreated(order);
      handleOpenChange(false);
    } catch (error) {
      if (error instanceof BffError) {
        const fieldErrors = mapBffErrorsToForm(error.errors);
        for (const [field, message] of Object.entries(fieldErrors)) {
          if (field in createSalesOrderDefaultValues) {
            form.setError(field as keyof CreateSalesOrderFormValues, { message });
          }
        }
        toast({
          variant: "error",
          title: "Could not create sales order",
          description: formatBffErrorMessage(error.message, error.errors),
        });
        return;
      }

      toast({
        variant: "error",
        title: "Could not create sales order",
        description:
          error instanceof Error ? error.message : "Something went wrong.",
      });
    }
  }

  function handleContinueToVisit() {
    if (!customer) {
      toast({
        variant: "error",
        title: "Client required",
        description: "Select a client before continuing to visit details.",
      });
      return;
    }

    setActiveTab("visit");
  }

  function renderFooter() {
    if (activeTab === "general") {
      return (
        <>
          <SecondaryButton
            type="button"
            disabled={isBusy}
            onClick={() => handleOpenChange(false)}
          >
            Cancel
          </SecondaryButton>
          <PrimaryButton
            type="button"
            disabled={isBusy || !hasCustomer}
            onClick={handleContinueToVisit}
          >
            Continue
          </PrimaryButton>
        </>
      );
    }

    return (
      <>
        <SecondaryButton
          type="button"
          disabled={isBusy}
          onClick={() => setActiveTab("general")}
        >
          Back
        </SecondaryButton>
        <SecondaryButton
          type="button"
          disabled={isBusy}
          onClick={() => handleOpenChange(false)}
        >
          Cancel
        </SecondaryButton>
        <PrimaryButton
          type="submit"
          form="create-sales-order-form"
          disabled={isBusy}
          data-testid="create-sales-order-submit"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              Creating...
            </>
          ) : (
            "Create order"
          )}
        </PrimaryButton>
      </>
    );
  }

  return (
    <TabbedDialog
      open={open}
      onOpenChange={handleOpenChange}
      title="New sales order"
      description="Capture the client and order basics first. You can add line items after the order is created."
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={(tabId) => {
        if (tabId === "general") {
          setActiveTab("general");
          return;
        }

        if (tabId === "visit" && hasCustomer) {
          setActiveTab("visit");
        }
      }}
      className={appFont.className}
      data-testid="create-sales-order-dialog"
      footer={renderFooter()}
    >
      <Form {...form}>
        <form
          id="create-sales-order-form"
          className="space-y-4"
          onSubmit={form.handleSubmit(handleSubmit)}
        >
          {activeTab === "general" ? (
            <>
              <div className="space-y-2">
                <FormLabel>Client</FormLabel>
                <CustomerAppointmentPicker
                  customer={customer}
                  onCustomerChange={handleCustomerChange}
                  disabled={isBusy}
                />
              </div>

              <FormField
                control={form.control}
                name="clientOrderRef"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Client reference</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Optional reference from the client"
                        disabled={isBusy}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="note"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        rows={3}
                        placeholder="Internal notes for this order"
                        disabled={isBusy}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          ) : (
            <>
              <SalesOrderVisitPicker
                customerUuid={customer?.uuid ?? null}
                visit={visit}
                onVisitChange={handleVisitChange}
                disabled={isBusy}
              />

              <SalesOrderPricelistPicker
                pricelist={pricelist}
                onPricelistChange={setPricelist}
                disabled={isBusy || isResolvingVisitPricelist}
                isLocked={Boolean(visit)}
              />
            </>
          )}
        </form>
      </Form>
    </TabbedDialog>
  );
}
