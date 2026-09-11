import { ACTIONS, TERMS } from "@/constants/copy";
import { ROUTES } from "@/constants/routes";
import type { CommandPaletteItem } from "@/features/app-shell/utils/build-command-palette-items";

export const COMMAND_PALETTE_ACTIONS_GROUP = "Actions";

export function buildCommandPaletteActions({
  canCreateClients,
  canCreateOrders,
  canCreateAppointments,
}: {
  canCreateClients: boolean;
  canCreateOrders: boolean;
  canCreateAppointments: boolean;
}): CommandPaletteItem[] {
  const items: CommandPaletteItem[] = [];

  if (canCreateClients) {
    items.push({
      href: `${ROUTES.customers}?new=1`,
      title: ACTIONS.newClient,
      subtitle: `Register a ${TERMS.client.toLowerCase()}`,
      group: COMMAND_PALETTE_ACTIONS_GROUP,
      icon: "user",
    });
  }

  if (canCreateAppointments) {
    items.push({
      href: `${ROUTES.appointments}?new=1`,
      title: ACTIONS.newAppointment,
      subtitle: `Book a ${TERMS.appointment.toLowerCase()}`,
      group: COMMAND_PALETTE_ACTIONS_GROUP,
      icon: "calendarClock",
    });
  }

  if (canCreateOrders) {
    items.push({
      href: `${ROUTES.salesOrders}?new=1`,
      title: ACTIONS.newSalesOrder,
      subtitle: `Charge a ${TERMS.client.toLowerCase()}`,
      group: COMMAND_PALETTE_ACTIONS_GROUP,
      icon: "file",
    });
  }

  return items;
}
