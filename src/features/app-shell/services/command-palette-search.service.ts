import { fetchCustomers } from "@/features/customers/services/customers.service";
import { fetchInvoices } from "@/features/invoices/services/invoices.service";
import { fetchSalesOrders } from "@/features/sales-orders/services/sales-orders.service";
import type { CommandPaletteItem } from "@/features/app-shell/utils/build-command-palette-items";
import {
  COMMAND_PALETTE_RECORD_PAGE_SIZE,
  mapCustomersToCommandPaletteItems,
  mapInvoicesToCommandPaletteItems,
  mapSalesOrdersToCommandPaletteItems,
} from "@/features/app-shell/utils/command-palette-records";

export type CommandPaletteSearchOptions = {
  query: string;
  canSearchClients: boolean;
  canSearchBilling: boolean;
};

async function resultsOrEmpty<T>(
  promise: Promise<{ results: T[] }>,
): Promise<T[]> {
  const settled = await Promise.allSettled([promise]);
  const result = settled[0];
  return result.status === "fulfilled" ? result.value.results : [];
}

export async function searchCommandPaletteRecords({
  query,
  canSearchClients,
  canSearchBilling,
}: CommandPaletteSearchOptions): Promise<CommandPaletteItem[]> {
  const search = query.trim();
  if (!search || (!canSearchClients && !canSearchBilling)) {
    return [];
  }

  const filters = {
    search,
    pageSize: COMMAND_PALETTE_RECORD_PAGE_SIZE,
  };

  const [customers, salesOrders, invoices] = await Promise.all([
    canSearchClients
      ? resultsOrEmpty(fetchCustomers(filters))
      : Promise.resolve([]),
    canSearchBilling
      ? resultsOrEmpty(fetchSalesOrders(filters))
      : Promise.resolve([]),
    canSearchBilling
      ? resultsOrEmpty(fetchInvoices(filters))
      : Promise.resolve([]),
  ]);

  return [
    ...mapCustomersToCommandPaletteItems(customers),
    ...mapSalesOrdersToCommandPaletteItems(salesOrders),
    ...mapInvoicesToCommandPaletteItems(invoices),
  ];
}
