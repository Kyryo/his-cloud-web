"use client";

import { MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type DetailRecordRowMenuAction = {
  label: string;
  onClick: () => void;
};

type DetailRecordRowMenuProps = {
  actions: DetailRecordRowMenuAction[];
  "data-testid"?: string;
};

export function DetailRecordRowMenu({
  actions,
  "data-testid": testId,
}: DetailRecordRowMenuProps) {
  if (actions.length === 0) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-7 text-brand-muted hover:text-brand-navy"
          aria-label="Row actions"
          data-testid={testId}
        >
          <MoreHorizontal className="size-4" aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {actions.map((action) => (
          <DropdownMenuItem
            key={action.label}
            onClick={(event) => {
              event.stopPropagation();
              action.onClick();
            }}
          >
            {action.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
