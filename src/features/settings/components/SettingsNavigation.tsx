"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { AppIcon } from "@/components/icons/app-icon";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  buildSettingsNavigation,
  findActiveSettingsNavigationItem,
  flattenSettingsNavigation,
  isSettingsNavigationItemActive,
  type SettingsNavigationCategory,
} from "@/features/settings/constants/settings-navigation-config";
import { cn } from "@/lib/utils";

type SettingsNavigationProps = {
  isTenantAdmin: boolean;
};

function SettingsNavList({
  categories,
  pathname,
}: {
  categories: SettingsNavigationCategory[];
  pathname: string;
}) {
  return (
    <nav aria-label="Settings" className="space-y-7">
      {categories.map((category) => (
        <div key={category.label} className="space-y-1.5">
          <p className="px-2.5 text-[11px] font-medium uppercase tracking-[0.14em] text-slate-400">
            {category.label}
          </p>
          <ul className="space-y-0.5">
            {category.items.map((item) => {
              const isActive = isSettingsNavigationItemActive(pathname, item);

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors",
                      isActive
                        ? "bg-slate-100 font-medium text-brand-navy"
                        : "text-slate-600 hover:bg-slate-50 hover:text-brand-navy",
                    )}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <AppIcon
                      name={item.icon}
                      size={16}
                      className={isActive ? "text-brand-navy" : "text-slate-400"}
                    />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

export function SettingsNavigation({ isTenantAdmin }: SettingsNavigationProps) {
  const pathname = usePathname();
  const router = useRouter();
  const categories = buildSettingsNavigation(isTenantAdmin);
  const flatItems = flattenSettingsNavigation(categories);
  const activeItem = findActiveSettingsNavigationItem(pathname, categories);

  return (
    <>
      <div className="shrink-0 lg:hidden">
        <Select
          value={activeItem?.href ?? flatItems[0]?.href}
          onValueChange={(value) => router.push(value)}
        >
          <SelectTrigger
            className="h-10 w-full border-brand-border bg-white"
            aria-label="Settings section"
          >
            <SelectValue placeholder="Choose a setting" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) =>
              category.items.map((item) => (
                <SelectItem key={item.href} value={item.href}>
                  {category.label} · {item.label}
                </SelectItem>
              )),
            )}
          </SelectContent>
        </Select>
      </div>

      <div className="hidden min-h-0 w-56 shrink-0 overflow-y-auto lg:block">
        <SettingsNavList categories={categories} pathname={pathname} />
      </div>
    </>
  );
}
