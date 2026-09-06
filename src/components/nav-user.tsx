"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";

import { AppIcon, type AppIconName } from "@/components/icons/app-icon";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { UserIdenticon } from "@/components/UserIdenticon";
import { ROUTES } from "@/constants/routes";
import { logout } from "@/features/auth/services/auth.service";
import { appFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { useUser } from "@/providers/user-provider";

function AccountMenuLink({
  href,
  icon,
  children,
  onNavigate,
}: {
  href: string;
  icon: AppIconName;
  children: ReactNode;
  onNavigate: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-foreground outline-none hover:bg-accent"
    >
      <AppIcon name={icon} size={16} />
      <span>{children}</span>
    </Link>
  );
}

export function NavUser() {
  const { userData } = useUser();
  const [open, setOpen] = useState(false);
  const displayName = userData?.name?.trim() || "Account";
  const email = userData?.email?.trim() ?? "";

  function closeMenu() {
    setOpen(false);
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <SidebarMenuButton
              size="lg"
              tooltip="Account"
              data-testid="sidebar-account-trigger"
              className="rounded-lg"
            >
              <UserIdenticon
                seed={email || displayName}
                name={displayName}
                className="size-8"
              />
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold text-brand-navy">
                  Account
                </span>
                {email ? (
                  <span className="truncate text-xs text-dash-muted">{email}</span>
                ) : null}
              </div>
              <AppIcon name="chevronRight" className="ml-auto" />
            </SidebarMenuButton>
          </PopoverTrigger>
          <PopoverContent
            side="right"
            align="end"
            sideOffset={8}
            className={cn(appFont.className, "w-64 p-1.5")}
            data-testid="sidebar-account-popover"
          >
            <Link
              href={ROUTES.settingsAccount}
              onClick={closeMenu}
              className="flex items-center gap-2.5 rounded-md px-2 py-2 outline-none hover:bg-accent"
            >
              <UserIdenticon
                seed={email || displayName}
                name={displayName}
                className="size-8"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-brand-navy">
                  Account
                </p>
                {displayName !== "Account" ? (
                  <p className="truncate text-xs text-dash-muted">{displayName}</p>
                ) : null}
                {email ? (
                  <p className="truncate text-xs text-dash-muted">{email}</p>
                ) : null}
              </div>
            </Link>
            <Separator className="my-1.5" />
            <AccountMenuLink
              href={ROUTES.contacts}
              icon="speech"
              onNavigate={closeMenu}
            >
              Support
            </AccountMenuLink>
            <AccountMenuLink
              href={ROUTES.settings}
              icon="settings"
              onNavigate={closeMenu}
            >
              Settings
            </AccountMenuLink>
            <Separator className="my-1.5" />
            <button
              type="button"
              data-testid="sidebar-account-logout"
              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-foreground outline-none hover:bg-accent"
              onClick={() => {
                closeMenu();
                void logout();
              }}
            >
              <AppIcon name="logout" size={16} />
              <span>Log out</span>
            </button>
          </PopoverContent>
        </Popover>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
