"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { AppIcon } from "@/components/icons/app-icon";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { buildCommandPaletteItems, groupCommandPaletteItems } from "@/features/app-shell/utils/build-command-palette-items";
import { buildSidebarNavItems } from "@/features/app-shell/utils/build-sidebar-nav";
import { useUser } from "@/providers/user-provider";

export function AppCommandMenu() {
  const router = useRouter();
  const pathname = usePathname();
  const { userData } = useUser();
  const [open, setOpen] = useState(false);

  const userGroups = useMemo(() => userData?.groups ?? [], [userData?.groups]);
  const isTenantAdmin = Boolean(userData?.is_admin);
  const isPlatformAdmin = Boolean(userData?.is_superuser && userData.tenant === null);

  const groupedItems = useMemo(() => {
    const navItems = buildSidebarNavItems(
      userGroups,
      pathname,
      isTenantAdmin,
      isPlatformAdmin,
    );

    return groupCommandPaletteItems(buildCommandPaletteItems(navItems));
  }, [isPlatformAdmin, isTenantAdmin, pathname, userGroups]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key.toLowerCase() !== "k" || !(event.metaKey || event.ctrlKey)) {
        return;
      }
      event.preventDefault();
      setOpen((current) => !current);
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  function handleSelect(href: string) {
    setOpen(false);
    router.push(href);
  }

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search pages…" />
      <CommandList data-testid="app-command-menu-list">
        <CommandEmpty>No matching pages.</CommandEmpty>
        {groupedItems.map((group) => (
          <CommandGroup key={group.group} heading={group.group}>
            {group.items.map((item) => (
              <CommandItem
                key={item.href}
                value={`${item.group} ${item.title}`}
                onSelect={() => handleSelect(item.href)}
              >
                {item.icon ? (
                  <AppIcon
                    name={item.icon}
                    size={16}
                    className="text-dash-muted"
                  />
                ) : null}
                <span>{item.title}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        ))}
      </CommandList>
    </CommandDialog>
  );
}
