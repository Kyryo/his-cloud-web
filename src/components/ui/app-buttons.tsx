import type { ComponentProps } from "react";

import { AppIcon } from "@/components/icons/app-icon";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type AppButtonProps = ComponentProps<typeof Button>;

export function PrimaryButton({ className, ...props }: AppButtonProps) {
  return (
    <Button
      variant="primary"
      className={cn("rounded-full px-5", className)}
      {...props}
    />
  );
}

export function SecondaryButton({ className, ...props }: AppButtonProps) {
  return (
    <Button
      variant="outline"
      className={cn(
        "rounded-full border-dash-border bg-white text-brand-slate hover:bg-white hover:text-brand-slate",
        className,
      )}
      {...props}
    />
  );
}

export function DestructiveButton({ className, ...props }: AppButtonProps) {
  return (
    <Button
      variant="destructive"
      className={cn("rounded-full px-5", className)}
      {...props}
    />
  );
}

type AddActionButtonProps = AppButtonProps & {
  label?: string;
  showIcon?: boolean;
  /** Outlined secondary styling for tab empty states. */
  emptyState?: boolean;
};

/** Secondary tab action — ghost style so page-level primary actions stay prominent. */
export function TabAddActionButton({
  label = "Add",
  showIcon = true,
  emptyState = false,
  className,
  children,
  ...props
}: AddActionButtonProps) {
  const content = (
    <>
      {showIcon ? <AppIcon name="add" size={14} /> : null}
      {children ?? label}
    </>
  );

  if (emptyState) {
    return (
      <SecondaryButton
        size="sm"
        className={cn("h-8 gap-1.5 px-4", className)}
        {...props}
      >
        {content}
      </SecondaryButton>
    );
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      className={cn("h-8 gap-1.5 px-2.5 text-brand-navy", className)}
      {...props}
    >
      {content}
    </Button>
  );
}

/** Page-level create action — square primary, not the dialog pill. */
export function PageActionButton({ className, ...props }: AppButtonProps) {
  return (
    <Button
      variant="primary"
      className={cn(
        "h-8 gap-1.5 rounded-lg px-3 text-[13px] font-medium shadow-xs transition-[transform,box-shadow] active:scale-[0.98]",
        className,
      )}
      {...props}
    />
  );
}

export function AddActionButton({
  label = "Add",
  showIcon = true,
  className,
  children,
  ...props
}: AddActionButtonProps) {
  return (
    <PrimaryButton className={className} {...props}>
      {showIcon ? <AppIcon name="add" size={16} /> : null}
      {children ?? label}
    </PrimaryButton>
  );
}

export { buttonVariants };
