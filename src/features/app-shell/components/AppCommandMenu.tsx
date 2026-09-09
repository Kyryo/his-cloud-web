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
import { AppCommandMenuSearchSkeleton } from "@/features/app-shell/components/AppCommandMenuSearchSkeleton";
import { useCommandPaletteSearch } from "@/features/app-shell/hooks/use-command-palette-search";
import {
  buildCommandPaletteItems,
  filterCommandPaletteItems,
  mergeCommandPaletteGroups,
} from "@/features/app-shell/utils/build-command-palette-items";
import { buildSidebarNavItems } from "@/features/app-shell/utils/build-sidebar-nav";
import {
  COMMAND_PALETTE_MIN_QUERY_LENGTH,
  COMMAND_PALETTE_SEARCH_DEBOUNCE_MS,
  canSearchCommandPaletteBilling,
  canSearchCommandPaletteClients,
} from "@/features/app-shell/utils/command-palette-records";
import { useUser } from "@/providers/user-provider";

export function AppCommandMenu() {
  const router = useRouter();
  const pathname = usePathname();
  const { userData } = useUser();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const userGroups = useMemo(() => userData?.groups ?? [], [userData?.groups]);
  const isTenantAdmin = Boolean(userData?.is_admin);
  const isPlatformAdmin = Boolean(userData?.is_superuser && userData.tenant === null);
  const accessOptions = { isTenantAdmin, isPlatformAdmin };
  const canSearchClients = canSearchCommandPaletteClients(
    userGroups,
    accessOptions,
  );
  const canSearchBilling = canSearchCommandPaletteBilling(
    userGroups,
    accessOptions,
  );

  const pageItems = useMemo(() => {
    const navItems = buildSidebarNavItems(
      userGroups,
      pathname,
      isTenantAdmin,
      isPlatformAdmin,
    );

    return filterCommandPaletteItems(
      buildCommandPaletteItems(navItems),
      search,
    );
  }, [isPlatformAdmin, isTenantAdmin, pathname, search, userGroups]);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, COMMAND_PALETTE_SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(handle);
  }, [search]);

  const { items: recordItems, isSearching } = useCommandPaletteSearch({
    query: debouncedSearch,
    enabled: open,
    canSearchClients,
    canSearchBilling,
  });

  const trimmedSearch = search.trim();
  const isAwaitingDebounce =
    trimmedSearch.length >= COMMAND_PALETTE_MIN_QUERY_LENGTH &&
    trimmedSearch !== debouncedSearch;
  const showRecordLoading =
    (canSearchClients || canSearchBilling) &&
    trimmedSearch.length >= COMMAND_PALETTE_MIN_QUERY_LENGTH &&
    (isSearching || isAwaitingDebounce);

  const groupedItems = useMemo(() => {
    const records =
      !showRecordLoading &&
      debouncedSearch.length >= COMMAND_PALETTE_MIN_QUERY_LENGTH
        ? recordItems
        : [];
    return mergeCommandPaletteGroups(records, pageItems);
  }, [
    debouncedSearch.length,
    pageItems,
    recordItems,
    showRecordLoading,
  ]);

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

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) {
      setSearch("");
      setDebouncedSearch("");
    }
  }

  function handleSelect(href: string) {
    handleOpenChange(false);
    router.push(href);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Search"
        aria-keyshortcuts="Meta+K Control+K"
        data-testid="app-command-menu-trigger"
        className="flex h-8 w-full max-w-md min-w-0 items-center gap-2 rounded-lg border border-dash-border/80 bg-white px-2.5 text-left text-sm text-dash-muted transition-colors hover:border-dash-border hover:text-brand-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/25"
      >
        <AppIcon name="search" size={16} className="shrink-0" />
        <span className="min-w-0 flex-1 truncate">Search</span>
        <kbd className="pointer-events-none hidden h-5 shrink-0 items-center rounded-md border border-dash-border/80 bg-dash-canvas px-1.5 font-sans text-[10px] font-medium text-dash-muted sm:inline-flex">
          ⌘K
        </kbd>
      </button>
      <CommandDialog
        open={open}
        onOpenChange={handleOpenChange}
        shouldFilter={false}
      >
        <CommandInput
          placeholder="Search clients, orders, invoices…"
          value={search}
          onValueChange={setSearch}
          isLoading={showRecordLoading}
        />
        <CommandList data-testid="app-command-menu-list">
          {showRecordLoading ? null : (
            <CommandEmpty>No matching results.</CommandEmpty>
          )}
          {showRecordLoading ? (
            <AppCommandMenuSearchSkeleton
              showClients={canSearchClients}
              showBilling={canSearchBilling}
            />
          ) : null}
          {groupedItems.map((group) => (
            <CommandGroup key={group.group} heading={group.group}>
              {group.items.map((item) => (
                <CommandItem
                  key={item.href}
                  value={`${item.group} ${item.title} ${item.href}`}
                  className={item.subtitle ? "items-start" : undefined}
                  onSelect={() => handleSelect(item.href)}
                >
                  {item.icon ? (
                    <AppIcon
                      name={item.icon}
                      size={16}
                      className="mt-0.5 shrink-0 text-dash-muted"
                    />
                  ) : null}
                  <span className="min-w-0 flex-1">
                    <span className="block truncate">{item.title}</span>
                    {item.subtitle ? (
                      <span className="block truncate text-xs text-dash-muted">
                        {item.subtitle}
                      </span>
                    ) : null}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          ))}
        </CommandList>
      </CommandDialog>
    </>
  );
}
