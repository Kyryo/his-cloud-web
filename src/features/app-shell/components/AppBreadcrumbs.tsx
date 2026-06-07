"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  applyPageLabelToCrumbs,
  buildAppBreadcrumbs,
} from "@/features/app-shell/utils/build-app-breadcrumbs";
import { useAppBreadcrumbContext } from "@/features/app-shell/providers/app-breadcrumb-provider";

export function AppBreadcrumbs() {
  const pathname = usePathname();
  const { pageLabel } = useAppBreadcrumbContext();
  const crumbs = useMemo(
    () => applyPageLabelToCrumbs(buildAppBreadcrumbs(pathname), pageLabel),
    [pathname, pageLabel],
  );

  if (crumbs.length === 0) {
    return null;
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1;

          return (
            <span key={`${crumb.label}-${index}`} className="contents">
              {index > 0 ? (
                <BreadcrumbSeparator className="hidden md:block" />
              ) : null}
              <BreadcrumbItem className={index === 0 ? "hidden md:block" : undefined}>
                {isLast || !crumb.href ? (
                  <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link href={crumb.href}>{crumb.label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </span>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
