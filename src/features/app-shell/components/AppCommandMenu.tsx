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
import { buildCommandPaletteActions } from "@/features/app-shell/utils/build-command-palette-actions";
import {
  buildCommandPaletteItems,
  filterCommandPaletteItems,
  mergeCommandPaletteGroups,
  type CommandPaletteItem,
} from "@/features/app-shell/utils/build-command-palette-items";
import { buildSidebarNavItems } from "@/features/app-shell/utils/build-sidebar-nav";
import {
  COMMAND_PALETTE_MIN_QUERY_LENGTH,
  COMMAND_PALETTE_SEARCH_DEBOUNCE_MS,
  canSearchCommandPaletteBilling,
  canSearchCommandPaletteClients,
} from "@/features/app-shell/utils/command-palette-records";
import { cn } from "@/lib/utils";
import { useUser } from "@/providers/user-provider";

function CommandHint({ children }: { children: string }) {
  return (
    <kbd className="inline-flex h-5 min-w-5 items-center justify-center rounded-md border border-dash-border bg-white px-1 font-sans text-[10px] text-dash-muted">
      {children}
    </kbd>
  );
}

function CommandPaletteItemRow({
  item,
  onSelect,
}: {
  item: CommandPaletteItem;
  onSelect: (href: string) => void;
}) {
  return (
    <CommandItem
      value={`${item.group} ${item.title} ${item.href}`}
      className={item.subtitle ? "items-start" : undefined}
      onSelect={() => onSelect(item.href)}
    >
      {item.icon ? (
        <span
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-lg bg-dash-canvas text-dash-muted group-data-[selected=true]:bg-white group-data-[selected=true]:text-brand-primary",
            item.subtitle ? "mt-0.5" : "",
          )}
        >
          <AppIcon name={item.icon} size={15} />
        </span>
      ) : null}
      <span className="min-w-0 flex-1">
        <span className="block truncate font-medium">{item.title}</span>
        {item.subtitle ? (
          <span className="mt-0.5 block truncate text-xs text-dash-muted">
            {item.subtitle}
          </span>
        ) : null}
      </span>
      <span className="hidden text-[10px] text-dash-muted group-data-[selected=true]:inline">
        ↵
      </span>
    </CommandItem>
  );
}

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

  const actionItems = useMemo(
    () =>
      filterCommandPaletteItems(
        buildCommandPaletteActions({
          canCreateClients: canSearchClients,
          canCreateAppointments: canSearchClients,
          canCreateOrders: canSearchBilling,
        }),
        search,
      ),
    [canSearchBilling, canSearchClients, search],
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
    return mergeCommandPaletteGroups(records, pageItems, actionItems);
  }, [
    actionItems,
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
        className="flex h-8 w-full max-w-md min-w-0 items-center gap-2 rounded-lg border border-dash-border/80 bg-white px-2.5 text-left text-[13px] text-dash-muted shadow-[0_1px_0_rgba(31,42,36,0.03)] transition-[border-color,color,box-shadow,transform] hover:border-dash-border hover:text-brand-navy hover:shadow-[0_1px_0_rgba(31,42,36,0.06)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/25 active:scale-[0.99]"
      >
        <span className="flex size-4 shrink-0 items-center justify-center text-dash-muted">
          <AppIcon name="search" size={14} />
        </span>
        <span className="min-w-0 flex-1 truncate">Search</span>
        <kbd className="pointer-events-none hidden h-5 shrink-0 items-center rounded-md bg-dash-canvas px-1.5 font-sans text-[10px] font-medium text-dash-muted sm:inline-flex">
          ⌘K
        </kbd>
      </button>
      <CommandDialog
        open={open}
        onOpenChange={handleOpenChange}
        shouldFilter={false}
      >
        <CommandInput
          placeholder="Find a client, order, invoice, or page…"
          value={search}
          onValueChange={setSearch}
          isLoading={showRecordLoading}
        />
        <div className="mx-4 h-px bg-dash-border/80" />
        <CommandList data-testid="app-command-menu-list">
          {showRecordLoading ? null : (
            <CommandEmpty>
              <span className="mx-auto mb-3 flex size-10 items-center justify-center rounded-2xl bg-dash-canvas text-dash-muted">
                <AppIcon name="search" size={18} />
              </span>
              <span className="block text-sm font-medium text-brand-navy">
                No matching results.
              </span>
              <span className="mt-1 block text-xs text-dash-muted">
                Try a name, identifier, or page.
              </span>
            </CommandEmpty>
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
                <CommandPaletteItemRow
                  key={item.href}
                  item={item}
                  onSelect={handleSelect}
                />
              ))}
            </CommandGroup>
          ))}
        </CommandList>
        <div className="flex items-center gap-5 border-t border-dash-border/70 px-4 py-2 text-[11px] text-dash-muted">
          <span className="flex items-center gap-1.5">
            <CommandHint>↑</CommandHint>
            <CommandHint>↓</CommandHint>
            Move
          </span>
          <span className="flex items-center gap-1.5">
            <CommandHint>↵</CommandHint>
            Open
          </span>
          <span className="flex items-center gap-1.5">
            <CommandHint>esc</CommandHint>
            Close
          </span>
        </div>
      </CommandDialog>
    </>
  );
}
