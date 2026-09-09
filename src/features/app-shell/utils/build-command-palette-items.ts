import { ROUTES } from "@/constants/routes";
import type { AppIconName } from "@/components/icons/app-icon";
import type { SidebarNavItem } from "@/features/app-shell/utils/build-sidebar-nav";

export type CommandPaletteItem = {
  href: string;
  title: string;
  group: string;
  subtitle?: string;
  icon?: AppIconName;
};

export type CommandPaletteGroup = {
  group: string;
  items: CommandPaletteItem[];
};

export const COMMAND_PALETTE_RECORD_GROUP_ORDER = [
  "Clients",
  "Sales orders",
  "Invoices",
] as const;

function isSettingsHref(href: string) {
  return href === ROUTES.settings || href.startsWith(`${ROUTES.settings}/`);
}

export function buildCommandPaletteItems(
  navItems: SidebarNavItem[],
): CommandPaletteItem[] {
  const items: CommandPaletteItem[] = [];
  const seen = new Set<string>();

  function add(item: CommandPaletteItem) {
    if (seen.has(item.href) || isSettingsHref(item.href)) {
      return;
    }
    seen.add(item.href);
    items.push(item);
  }

  for (const nav of navItems) {
    if (nav.items?.length) {
      for (const sub of nav.items) {
        add({
          href: sub.url,
          title: sub.title,
          group: nav.title,
          icon: nav.icon,
        });
      }
      continue;
    }

    add({
      href: nav.url,
      title: nav.title,
      group: nav.section === "admin" ? "Admin" : "Pages",
      icon: nav.icon,
    });
  }

  add({
    href: ROUTES.notifications,
    title: "Notifications",
    group: "Pages",
    icon: "notification",
  });

  return items;
}

export function groupCommandPaletteItems(
  items: CommandPaletteItem[],
): CommandPaletteGroup[] {
  const groups = new Map<string, CommandPaletteItem[]>();

  for (const item of items) {
    const existing = groups.get(item.group);
    if (existing) {
      existing.push(item);
    } else {
      groups.set(item.group, [item]);
    }
  }

  return [...groups.entries()].map(([group, groupItems]) => ({
    group,
    items: groupItems,
  }));
}

export function filterCommandPaletteItems(
  items: CommandPaletteItem[],
  query: string,
): CommandPaletteItem[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return items;
  }

  return items.filter((item) => {
    const haystack = [item.title, item.group, item.subtitle ?? ""]
      .join(" ")
      .toLowerCase();
    return haystack.includes(normalized);
  });
}

export function mergeCommandPaletteGroups(
  recordItems: CommandPaletteItem[],
  pageItems: CommandPaletteItem[],
): CommandPaletteGroup[] {
  const recordByGroup = new Map(
    groupCommandPaletteItems(recordItems).map((group) => [group.group, group]),
  );
  const recordGroups = COMMAND_PALETTE_RECORD_GROUP_ORDER.flatMap((name) => {
    const group = recordByGroup.get(name);
    return group && group.items.length > 0 ? [group] : [];
  });
  const pageGroups = groupCommandPaletteItems(pageItems).filter(
    (group) => group.items.length > 0,
  );

  return [...recordGroups, ...pageGroups];
}
