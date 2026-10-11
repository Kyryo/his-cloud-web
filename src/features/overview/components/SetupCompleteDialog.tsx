"use client";

import { Check } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { PrimaryButton, SecondaryButton } from "@/components/ui/app-buttons";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { customersHref } from "@/features/customers/utils/customer-list-url";

type SetupCompleteDialogProps = {
  clinicName: string;
  completedAt: string | null;
};

function seenStorageKey(completedAt: string | null) {
  return `sigma.setup-complete.${completedAt ?? "latest"}`;
}

function readSeen(key: string) {
  try {
    return sessionStorage.getItem(key) === "1";
  } catch {
    return false;
  }
}

function markSeen(key: string) {
  try {
    sessionStorage.setItem(key, "1");
  } catch {
    // Private browsing can block storage. Closing the dialog is still enough.
  }
}

export function SetupCompleteDialog({
  clinicName,
  completedAt,
}: SetupCompleteDialogProps) {
  const storageKey = seenStorageKey(completedAt);
  const [open, setOpen] = useState(false);
  const name = clinicName.trim() || "Your clinic";

  useEffect(() => {
    if (!readSeen(storageKey)) {
      setOpen(true);
    }
  }, [storageKey]);

  function dismiss() {
    markSeen(storageKey);
    setOpen(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (next) {
          setOpen(true);
          return;
        }
        dismiss();
      }}
    >
      <DialogContent
        data-testid="setup-complete-dialog"
        className="max-w-[22rem] gap-0 rounded-[28px] border-0 px-8 pb-8 pt-12 text-center shadow-2xl"
      >
        <span
          aria-hidden
          className="mx-auto flex size-16 items-center justify-center rounded-full bg-brand-tint text-brand-primary"
        >
          <Check className="size-8" strokeWidth={2.25} />
        </span>
        <DialogHeader className="mt-6 items-center gap-2 pr-0">
          <DialogTitle className="text-[26px] font-semibold tracking-tight">
            You're all set
          </DialogTitle>
          <DialogDescription className="text-[15px] leading-6 text-brand-navy">
            {name} is ready for its first client.
          </DialogDescription>
        </DialogHeader>
        <p className="mt-2 text-sm leading-6 text-dash-muted">
          Register a client to open a visit, book an appointment, or send a bill.
        </p>
        <div className="mt-8 flex flex-col gap-2">
          <PrimaryButton asChild className="h-11 w-full">
            <Link href={customersHref({ newClient: true })} onClick={dismiss}>
              Register a client
            </Link>
          </PrimaryButton>
          <SecondaryButton type="button" className="h-11 w-full" onClick={dismiss}>
            Not now
          </SecondaryButton>
        </div>
      </DialogContent>
    </Dialog>
  );
}
