/** User-facing words. Use these instead of domain/code names like "customer". */
export const TERMS = {
  client: "Client",
  clients: "Clients",
  visit: "Visit",
  appointment: "Appointment",
  salesOrder: "Sales order",
  salesOrders: "Sales orders",
  invoice: "Invoice",
  invoices: "Invoices",
  identifier: "Identifier",
  reference: "Reference",
} as const;

export const ACTIONS = {
  newClient: "New client",
  registerClient: "Register client",
  newAppointment: "New appointment",
  startVisit: "Start visit",
  newSalesOrder: "New sales order",
  newOrder: "New order",
} as const;
