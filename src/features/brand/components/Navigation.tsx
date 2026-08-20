"use client";

import { useMotionValueEvent, useScroll } from "framer-motion";
import { ChevronDown, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { ROUTES } from "@/constants/routes";
import { LandingLogo } from "@/features/brand/components/landing/LandingLogo";
import {
  BRAND_NAV_ITEMS,
  getMenuChildLinks,
  type BrandNavChild,
  type BrandNavItem,
  type BrandNavSection,
} from "@/features/brand/constants/nav-links";
import { cn } from "@/lib/utils";

function isPathActive(pathname: string, href: string) {
  if (href === ROUTES.home) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

function isItemActive(pathname: string, item: BrandNavItem) {
  if (item.kind === "link") return isPathActive(pathname, item.href);
  return (
    isPathActive(pathname, item.href) ||
    getMenuChildLinks(item).some((child) => isPathActive(pathname, child.href))
  );
}

function MegaMenuLink({
  child,
  pathname,
  onNavigate,
  tone = "default",
}: {
  child: BrandNavChild;
  pathname: string;
  onNavigate?: () => void;
  tone?: "default" | "featured";
}) {
  const active = isPathActive(pathname, child.href);

  return (
    <Link
      href={child.href}
      role="menuitem"
      className={cn(
        "landing-focus block rounded-xl px-3 py-3 transition-colors",
        tone === "featured"
          ? active
            ? "bg-white"
            : "hover:bg-white/80"
          : active
            ? "bg-[color:var(--landing-warm)]"
            : "hover:bg-[color:var(--landing-warm)]",
      )}
      onClick={onNavigate}
    >
      <span className="block text-[15px] font-semibold tracking-[-0.01em] text-[color:var(--landing-ink)]">
        {child.name}
      </span>
      {child.description ? (
        <span className="mt-1 block text-[13px] leading-snug text-[color:var(--landing-ledger-ink)]">
          {child.description}
        </span>
      ) : null}
    </Link>
  );
}

function MegaMenuSection({
  section,
  pathname,
  columns = 2,
}: {
  section: BrandNavSection;
  pathname: string;
  columns?: 1 | 2;
}) {
  return (
    <div>
      <p className="px-3 text-[13px] font-medium text-[color:var(--landing-ledger-ink)]">
        {section.title}
      </p>
      <div
        className={cn(
          "mt-2 grid gap-x-2 gap-y-1",
          columns === 2 ? "sm:grid-cols-2" : "grid-cols-1",
        )}
      >
        {section.items.map((child) => (
          <MegaMenuLink
            key={`${section.title}-${child.href}-${child.name}`}
            child={child}
            pathname={pathname}
          />
        ))}
      </div>
    </div>
  );
}

function DesktopNavMenu({
  item,
  pathname,
}: {
  item: Extract<BrandNavItem, { kind: "menu" }>;
  pathname: string;
}) {
  const active = isItemActive(pathname, item);
  const featured = item.featured;

  return (
    <div className="group relative">
      <Link
        href={item.href}
        className={cn(
          "landing-focus inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 transition-colors",
          "text-[color:var(--landing-ledger-ink)] group-hover:bg-[color:var(--landing-warm)] group-hover:text-[color:var(--landing-ink)]",
          active && "bg-[color:var(--landing-warm)] text-[color:var(--landing-ink)]",
        )}
        aria-haspopup="menu"
      >
        {item.name}
        <ChevronDown
          className="size-3.5 opacity-60 transition-transform duration-300 group-hover:rotate-180"
          aria-hidden="true"
        />
      </Link>

      <div
        className={cn(
          "pointer-events-none invisible absolute left-1/2 top-full z-50 -translate-x-1/2 translate-y-2 pt-3 opacity-0",
          "transition-[opacity,transform,visibility] delay-75 duration-200 ease-out",
          "group-hover:pointer-events-auto group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-hover:delay-0",
          "group-focus-within:pointer-events-auto group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100",
        )}
      >
        {/* Pointer bridge so the cursor can travel into the panel */}
        <div
          aria-hidden="true"
          className="absolute inset-x-8 top-0 h-3"
        />
        <div
          role="menu"
          className={cn(
            "flex min-w-[36rem] overflow-hidden rounded-[1.75rem] border border-[color:var(--landing-border)] bg-white",
            "shadow-[0_28px_80px_-36px_rgba(31,42,36,0.45)]",
            featured ? "w-[44rem]" : "w-[36rem]",
          )}
        >
          <div className="flex-1 bg-white p-5 sm:p-6">
            {item.sections.map((section) => (
              <MegaMenuSection
                key={section.title}
                section={section}
                pathname={pathname}
                columns={2}
              />
            ))}
          </div>

          {featured ? (
            <div className="w-[14.5rem] shrink-0 bg-[color:var(--landing-warm)] p-5 sm:p-6">
              <p className="px-3 text-[13px] font-medium text-[color:var(--landing-ledger-ink)]">
                {featured.title}
              </p>
              <div className="mt-2 space-y-1">
                {featured.items.map((child) => (
                  <MegaMenuLink
                    key={`${featured.title}-${child.href}-${child.name}`}
                    child={child}
                    pathname={pathname}
                    tone="featured"
                  />
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function MobileNavMenu({
  item,
  pathname,
  onNavigate,
}: {
  item: Extract<BrandNavItem, { kind: "menu" }>;
  pathname: string;
  onNavigate: () => void;
}) {
  const [expanded, setExpanded] = useState(() => isItemActive(pathname, item));
  const links = getMenuChildLinks(item);

  return (
    <div className="border-b border-[color:var(--landing-border)] last:border-b-0">
      <button
        type="button"
        className="landing-focus flex w-full items-center justify-between px-2 py-3 text-left text-sm font-semibold text-[color:var(--landing-ink)]"
        aria-expanded={expanded}
        onClick={() => setExpanded((open) => !open)}
      >
        {item.name}
        <ChevronDown
          className={cn(
            "size-4 text-[color:var(--landing-ledger-ink)] transition-transform duration-200",
            expanded && "rotate-180",
          )}
          aria-hidden="true"
        />
      </button>
      {expanded ? (
        <div className="space-y-1 pb-3 pl-2">
          {links.map((child) => (
            <Link
              key={`${item.name}-${child.href}-${child.name}`}
              href={child.href}
              className={cn(
                "landing-focus block rounded-xl px-3 py-2.5",
                isPathActive(pathname, child.href)
                  ? "bg-[color:var(--landing-warm)]"
                  : "hover:bg-[color:var(--landing-warm)]",
              )}
              onClick={onNavigate}
            >
              <span className="block text-sm font-semibold text-[color:var(--landing-ink)]">
                {child.name}
              </span>
              {child.description ? (
                <span className="mt-0.5 block text-xs leading-snug text-[color:var(--landing-ledger-ink)]">
                  {child.description}
                </span>
              ) : null}
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const { scrollY } = useScroll();
  const isHome = pathname === ROUTES.home;
  const isGlass = !isHome || isScrolled || isOpen;

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 12);
  });

  return (
    <nav
      className={cn(
        "fixed top-0 z-50 w-full transition-[background-color,backdrop-filter] duration-300",
        isGlass
          ? "landing-nav-glass bg-white/72 backdrop-blur-xl"
          : "bg-transparent",
      )}
    >
      <div className="mx-auto h-16 max-w-6xl px-6 sm:px-10 lg:px-12">
        <div className="grid h-full grid-cols-[auto_1fr_auto] items-center gap-4 lg:grid-cols-[1fr_auto_1fr]">
          <LandingLogo
            className="justify-self-start"
            priority
            showWordmark
            imageClassName="h-9 w-auto sm:h-10"
          />

          <div className="hidden items-center justify-center gap-1 text-sm font-medium lg:flex">
            {BRAND_NAV_ITEMS.map((item) => {
              if (item.kind === "menu") {
                return (
                  <DesktopNavMenu
                    key={item.name}
                    item={item}
                    pathname={pathname}
                  />
                );
              }

              const active = isPathActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "landing-focus rounded-full px-3.5 py-2 transition-colors",
                    active
                      ? "bg-[color:var(--landing-warm)] text-[color:var(--landing-ink)]"
                      : "text-[color:var(--landing-ledger-ink)] hover:bg-[color:var(--landing-warm)] hover:text-[color:var(--landing-ink)]",
                  )}
                >
                  {item.name}
                </Link>
              );
            })}
          </div>

          <div className="hidden items-center justify-self-end gap-2 lg:flex">
            <Link
              href={ROUTES.auth}
              className="landing-focus inline-flex min-h-10 items-center justify-center rounded-full px-4 py-2 text-sm font-semibold text-[color:var(--landing-ledger-ink)] transition-colors hover:bg-[color:var(--landing-warm)] hover:text-[color:var(--landing-ink)]"
            >
              Sign In
            </Link>
            <Link
              href={ROUTES.signup}
              className="landing-focus landing-btn-primary inline-flex min-h-10 items-center justify-center rounded-full px-5 py-2 text-sm font-semibold"
            >
              Start for free
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setIsOpen((open) => !open)}
            className={cn(
              "landing-focus flex size-10 items-center justify-center justify-self-end rounded-full text-[color:var(--landing-ink)] transition-colors hover:bg-[color:var(--landing-warm)] lg:hidden",
              isGlass && "bg-white/80",
            )}
            aria-label={isOpen ? "Close menu" : "Open menu"}
            aria-expanded={isOpen}
          >
            {isOpen ? (
              <X className="size-5" strokeWidth={1.75} aria-hidden="true" />
            ) : (
              <Menu className="size-5" strokeWidth={1.75} aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {isOpen ? (
        <div className="absolute left-0 right-0 top-16 border-t border-[color:var(--landing-border)] bg-white/95 backdrop-blur-xl lg:hidden">
          <div className="mx-auto max-w-6xl px-6 py-3 sm:px-10 lg:px-12">
            <div className="space-y-0">
              {BRAND_NAV_ITEMS.map((item) => {
                if (item.kind === "menu") {
                  return (
                    <MobileNavMenu
                      key={item.name}
                      item={item}
                      pathname={pathname}
                      onNavigate={() => setIsOpen(false)}
                    />
                  );
                }

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "landing-focus block border-b border-[color:var(--landing-border)] px-2 py-3 text-sm font-semibold last:border-b-0",
                      isPathActive(pathname, item.href)
                        ? "text-[color:var(--landing-ink)]"
                        : "text-[color:var(--landing-ledger-ink)]",
                    )}
                    onClick={() => setIsOpen(false)}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </div>

            <div className="flex flex-col gap-2 border-t border-[color:var(--landing-border)] pt-4">
              <Link
                href={ROUTES.auth}
                className="landing-focus inline-flex min-h-11 items-center justify-center rounded-full px-5 py-2.5 text-center text-sm font-semibold text-[color:var(--landing-ledger-ink)] transition-colors hover:bg-[color:var(--landing-warm)]"
                onClick={() => setIsOpen(false)}
              >
                Sign In
              </Link>
              <Link
                href={ROUTES.signup}
                className="landing-focus landing-btn-primary inline-flex min-h-11 items-center justify-center rounded-full px-5 py-2.5 text-center text-sm font-semibold"
                onClick={() => setIsOpen(false)}
              >
                Start for free
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </nav>
  );
}
