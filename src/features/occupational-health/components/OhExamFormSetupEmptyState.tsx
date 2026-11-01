"use client";

import Link from "next/link";
import { ClipboardList } from "lucide-react";

import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";

const SETUP_HREF = `${ROUTES.settingsModuleOccupationalHealth}?tab=programmes`;

/** Full-workspace empty state when no OH exam form has been published. */
export function OhExamFormSetupEmptyState() {
  return (
    <div
      className="flex min-h-full flex-1 items-center justify-center bg-white px-6 py-16"
      data-testid="oh-exam-form-setup-empty"
    >
      <EmptyState
        icon={ClipboardList}
        title="No occupational health form published"
        description="Publish a programme form in settings before recording examinations for this encounter."
        action={
          <Button asChild>
            <Link href={SETUP_HREF}>Set up OH form</Link>
          </Button>
        }
      />
    </div>
  );
}
