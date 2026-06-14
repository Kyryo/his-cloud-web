import Link from "next/link";
import { ArrowLeft, Home, SearchX } from "lucide-react";

import { PrimaryButton, SecondaryButton } from "@/components/ui/app-buttons";
import { siteConfig } from "@/constants/site";
import { ROUTES } from "@/constants/routes";
import { appFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";

type NotFoundContentProps = {
  className?: string;
  showShellHint?: boolean;
};

export function NotFoundContent({
  className,
  showShellHint = false,
}: NotFoundContentProps) {
  return (
    <div
      className={cn(
        "flex min-h-[60vh] flex-col items-center justify-center px-6 py-16 text-center",
        appFont.className,
        className,
      )}
    >
      <div className="relative mb-8 flex size-20 items-center justify-center rounded-2xl border border-brand-border/60 bg-white shadow-sm">
        <SearchX className="size-9 text-brand-primary" aria-hidden="true" />
        <span className="absolute -right-3 -top-3 rounded-full bg-brand-primary px-2.5 py-1 text-xs font-semibold text-white">
          404
        </span>
      </div>

      <h1 className="text-3xl font-semibold tracking-tight text-brand-navy sm:text-4xl">
        Page not found
      </h1>
      <p className="mt-3 max-w-md text-sm leading-6 text-brand-muted sm:text-base">
        {showShellHint
          ? "The page you requested does not exist or may have been moved. Use the navigation below to get back on track."
          : `The page you requested does not exist on ${siteConfig.name}. Head back to continue working.`}
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <PrimaryButton asChild>
          <Link href={ROUTES.postAuth}>
            <Home className="size-4" aria-hidden="true" />
            Go to clients
          </Link>
        </PrimaryButton>
        <SecondaryButton asChild>
          <Link href={ROUTES.home}>
            <ArrowLeft className="size-4" aria-hidden="true" />
            Back to home
          </Link>
        </SecondaryButton>
      </div>
    </div>
  );
}
