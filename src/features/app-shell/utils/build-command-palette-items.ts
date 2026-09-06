import { ROUTES } from "@/constants/routes";
import type { AppIconName } from "@/components/icons/app-icon";
import type { SidebarNavItem } from "@/features/app-shell/utils/build-sidebar-nav";

export type CommandPaletteItem = {
  href: string;
  title: string;
  group: string;
  icon?: AppIconName;
};

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

export function groupCommandPaletteItems(items: CommandPaletteItem[]) {
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
