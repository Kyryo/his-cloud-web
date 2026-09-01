"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

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
    <nav aria-label="Settings" className="space-y-6">
      {categories.map((category) => (
        <div key={category.label} className="space-y-1">
          <p
            className="px-3 text-[11px] font-medium uppercase tracking-[0.12em] text-brand-muted"
          >
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
                      "block rounded-md px-3 py-2 text-sm transition-colors",
                      isActive
                        ? "bg-brand-tint font-medium text-brand-primary"
                        : "text-brand-navy hover:bg-slate-50",
                    )}
                    aria-current={isActive ? "page" : undefined}
                  >
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
      <div className="lg:hidden">
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

      <div className="hidden shrink-0 lg:block lg:w-52">
        <SettingsNavList categories={categories} pathname={pathname} />
      </div>
    </>
  );
}
