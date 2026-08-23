"use client";

import Link from "next/link";

import { AppIcon } from "@/components/icons/app-icon";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { ROUTES } from "@/constants/routes";
import { logout } from "@/features/auth/services/auth.service";

export function NavUser() {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton asChild tooltip="Profile">
          <Link href={ROUTES.settingsAccount}>
            <AppIcon name="user" />
            <span>Profile</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton tooltip="Log out" onClick={() => void logout()}>
          <AppIcon name="logout" />
          <span>Log out</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
