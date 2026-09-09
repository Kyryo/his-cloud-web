import { ROUTES } from "@/constants/routes";
import type { Customer } from "@/features/customers/types/customer.types";
import { formatCustomerName } from "@/features/customers/utils/format-customer";
import type { Invoice } from "@/features/invoices/types/invoice.types";
import type { SalesOrder } from "@/features/sales-orders/types/sales-order.types";
import type { CommandPaletteItem } from "@/features/app-shell/utils/build-command-palette-items";

export const COMMAND_PALETTE_MIN_QUERY_LENGTH = 2;
export const COMMAND_PALETTE_RECORD_PAGE_SIZE = 5;
export const COMMAND_PALETTE_SEARCH_DEBOUNCE_MS = 250;

export const COMMAND_PALETTE_CLIENTS_GROUP = "Clients";
export const COMMAND_PALETTE_SALES_ORDERS_GROUP = "Sales orders";
export const COMMAND_PALETTE_INVOICES_GROUP = "Invoices";

type CommandPaletteAccessOptions = {
  isTenantAdmin?: boolean;
  isPlatformAdmin?: boolean;
};

function effectiveGroups(userGroups: string[]) {
  return userGroups.length > 0 ? userGroups : ["Registration"];
}

export function canSearchCommandPaletteClients(
  userGroups: string[],
  options: CommandPaletteAccessOptions = {},
) {
  if (options.isPlatformAdmin) {
    return false;
  }
  if (options.isTenantAdmin) {
    return true;
  }
  return effectiveGroups(userGroups).includes("Registration");
}

export function canSearchCommandPaletteBilling(
  userGroups: string[],
  options: CommandPaletteAccessOptions = {},
) {
  if (options.isPlatformAdmin) {
    return false;
  }
  if (options.isTenantAdmin) {
    return true;
  }
  return effectiveGroups(userGroups).includes("Billing");
}

function optionalSubtitle(value: string | null | undefined, title: string) {
  const subtitle = value?.trim();
  if (!subtitle || subtitle === title) {
    return undefined;
  }
  return subtitle;
}

export function mapCustomersToCommandPaletteItems(
  customers: Array<
    Pick<
      Customer,
      | "uuid"
      | "first_name"
      | "middle_name"
      | "last_name"
      | "full_name"
      | "customer_identifier"
    >
  >,
): CommandPaletteItem[] {
  return customers.flatMap((customer) => {
    if (!customer.uuid) {
      return [];
    }

    const title =
      formatCustomerName(customer) || customer.customer_identifier.trim();
    if (!title) {
      return [];
    }

    return [
      {
        href: ROUTES.customerDetail(customer.uuid),
        title,
        subtitle: optionalSubtitle(customer.customer_identifier, title),
        group: COMMAND_PALETTE_CLIENTS_GROUP,
        icon: "user",
      },
    ];
  });
}

export function mapSalesOrdersToCommandPaletteItems(
  orders: Array<Pick<SalesOrder, "uuid" | "name" | "customer_name">>,
): CommandPaletteItem[] {
  return orders.flatMap((order) => {
    if (!order.uuid) {
      return [];
    }

    const title = order.name.trim() || "Sales order";

    return [
      {
        href: ROUTES.salesOrderDetail(order.uuid),
        title,
        subtitle: optionalSubtitle(order.customer_name, title),
        group: COMMAND_PALETTE_SALES_ORDERS_GROUP,
        icon: "file",
      },
    ];
  });
}

export function mapInvoicesToCommandPaletteItems(
  invoices: Array<Pick<Invoice, "uuid" | "name" | "customer_name">>,
): CommandPaletteItem[] {
  return invoices.flatMap((invoice) => {
    if (!invoice.uuid) {
      return [];
    }

    const title = invoice.name.trim() || "Invoice";

    return [
      {
        href: ROUTES.invoiceDetail(invoice.uuid),
        title,
        subtitle: optionalSubtitle(invoice.customer_name, title),
        group: COMMAND_PALETTE_INVOICES_GROUP,
        icon: "invoice",
      },
    ];
  });
}
