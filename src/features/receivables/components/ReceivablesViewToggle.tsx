"use client";

import Link from "next/link";
import { FileText, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import {
  receivablesHref,
  type ReceivablesView,
} from "@/features/receivables/utils/receivables-views";
import { cn } from "@/lib/utils";

type ReceivablesViewToggleProps = {
  view: ReceivablesView;
  search: string;
};

const VIEW_OPTIONS: Array<{
  view: ReceivablesView;
  label: string;
  icon: typeof Users;
}> = [
  { view: "debtors", label: "Debtors", icon: Users },
  { view: "invoices", label: "Open invoices", icon: FileText },
];

export function ReceivablesViewToggle({
  view,
  search,
}: ReceivablesViewToggleProps) {
  return (
    <ButtonGroup aria-label="Receivables view" data-testid="receivables-view-toggle">
      {VIEW_OPTIONS.map((option) => {
        const isCurrent = view === option.view;

        return (
          <Button
            key={option.view}
            asChild
            variant="outline"
            size="sm"
            className={cn(isCurrent && "bg-brand-primary/5 text-brand-primary")}
          >
            <Link
              href={receivablesHref({ view: option.view, search })}
              aria-current={isCurrent ? "page" : undefined}
            >
              <option.icon className="size-4" aria-hidden="true" />
              {option.label}
            </Link>
          </Button>
        );
      })}
    </ButtonGroup>
  );
}
