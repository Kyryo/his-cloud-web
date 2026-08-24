"use client";

import Link from "next/link";

import { AppIcon } from "@/components/icons/app-icon";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import type { SidebarNavItem } from "@/features/app-shell/utils/build-sidebar-nav";
import { cn } from "@/lib/utils";

function NavMenuItems({ items }: { items: SidebarNavItem[] }) {
  return (
    <SidebarMenu>
      {items.map((item) =>
        item.items?.length ? (
          <Collapsible
            key={item.title}
            asChild
            defaultOpen={item.isActive}
            className="group/collapsible"
          >
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton tooltip={item.title} isActive={item.isActive}>
                  {item.icon ? <AppIcon name={item.icon} /> : null}
                  <span>{item.title}</span>
                  <AppIcon
                    name="chevronRight"
                    className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90"
                  />
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub>
                  {item.items.map((subItem) => (
                    <SidebarMenuSubItem key={subItem.title}>
                      <SidebarMenuSubButton asChild isActive={subItem.isActive}>
                        <Link href={subItem.url}>
                          <span>{subItem.title}</span>
                        </Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  ))}
                </SidebarMenuSub>
              </CollapsibleContent>
            </SidebarMenuItem>
          </Collapsible>
        ) : (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton asChild isActive={item.isActive} tooltip={item.title}>
              <Link href={item.url}>
                {item.icon ? <AppIcon name={item.icon} /> : null}
                <span>{item.title}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ),
      )}
    </SidebarMenu>
  );
}

export function NavMain({ items }: { items: SidebarNavItem[] }) {
  const workspaceItems = items.filter((item) => item.section !== "admin");
  const adminItems = items.filter((item) => item.section === "admin");

  if (items.length === 0) {
    return null;
  }

  return (
    <>
      {workspaceItems.length > 0 ? (
        <SidebarGroup className="pt-1">
          <NavMenuItems items={workspaceItems} />
        </SidebarGroup>
      ) : null}
      {adminItems.length > 0 ? (
        <SidebarGroup>
          <SidebarGroupLabel
            className={cn(
              "h-7 px-3 text-[11px] font-medium uppercase tracking-[0.14em] text-dash-muted",
            )}
          >
            Admin
          </SidebarGroupLabel>
          <NavMenuItems items={adminItems} />
        </SidebarGroup>
      ) : null}
    </>
  );
}
