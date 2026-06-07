import { Plus } from "lucide-react";
import type { ComponentProps } from "react";

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
      className={cn("rounded-full border-brand-navy text-brand-navy", className)}
      {...props}
    />
  );
}

type AddActionButtonProps = AppButtonProps & {
  label?: string;
  showIcon?: boolean;
};

export function AddActionButton({
  label = "Add",
  showIcon = true,
  className,
  children,
  ...props
}: AddActionButtonProps) {
  return (
    <PrimaryButton className={className} {...props}>
      {showIcon ? <Plus className="size-4" aria-hidden="true" /> : null}
      {children ?? label}
    </PrimaryButton>
  );
}

export { buttonVariants };
