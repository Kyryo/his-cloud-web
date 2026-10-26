"use client";

import { Loader2 } from "lucide-react";
import { useState } from "react";

import {
  DestructiveButton,
  PrimaryButton,
  SecondaryButton,
} from "@/components/ui/app-buttons";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RequiredFieldMarker } from "@/components/ui/required-field-marker";
import { Textarea } from "@/components/ui/textarea";
import type { PendingOpdBoardMove } from "@/features/clinical-opd/hooks/use-opd-queue-board-move";
import { appFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";

type OpdQueueBoardMoveDialogProps = {
  pending: PendingOpdBoardMove | null;
  isConfirming: boolean;
  onDismiss: () => void;
  onConfirm: (note?: string) => void;
};

export function OpdQueueBoardMoveDialog({
  pending,
  isConfirming,
  onDismiss,
  onConfirm,
}: OpdQueueBoardMoveDialogProps) {
  const isReady = pending?.stage === "triaged";

  return (
    <Dialog
      open={pending !== null}
      onOpenChange={(open) => {
        if (!open) {
          onDismiss();
        }
      }}
    >
      <DialogContent
        className={cn("sm:max-w-md", appFont.className)}
        data-testid="opd-queue-board-move-dialog"
      >
        <DialogHeader>
          <DialogTitle>
            {isReady ? "Mark ready for the doctor?" : "Cancel this encounter?"}
          </DialogTitle>
          <DialogDescription>
            {isReady
              ? `A signed nursing note moves ${pending?.encounter.customer_name ?? "this client"} to Ready.`
              : `Cancel the encounter for ${pending?.encounter.customer_name ?? "this client"}. This closes it on the queue.`}
          </DialogDescription>
        </DialogHeader>

        {isReady && pending ? (
          <ReadyNoteForm
            key={pending.encounter.encounter_uuid}
            isConfirming={isConfirming}
            onDismiss={onDismiss}
            onConfirm={onConfirm}
          />
        ) : (
          <DialogFooter>
            <SecondaryButton
              type="button"
              disabled={isConfirming}
              className="rounded-full"
              onClick={onDismiss}
            >
              Keep as is
            </SecondaryButton>
            <DestructiveButton
              type="button"
              className="rounded-full"
              disabled={isConfirming}
              onClick={() => onConfirm()}
            >
              {isConfirming ? <Loader2 className="size-4 animate-spin" /> : null}
              Cancel encounter
            </DestructiveButton>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

function ReadyNoteForm({
  isConfirming,
  onDismiss,
  onConfirm,
}: {
  isConfirming: boolean;
  onDismiss: () => void;
  onConfirm: (note?: string) => void;
}) {
  const [note, setNote] = useState("");
  const trimmedNote = note.trim();

  return (
    <form
      className="mt-4"
      onSubmit={(event) => {
        event.preventDefault();
        if (trimmedNote.length > 0) {
          onConfirm(trimmedNote);
        }
      }}
    >
      <div className="space-y-2">
        <Label htmlFor="opd-board-ready-note">
          Nursing note <RequiredFieldMarker />
        </Label>
        <Textarea
          id="opd-board-ready-note"
          value={note}
          disabled={isConfirming}
          placeholder="Alert and waiting for the doctor."
          onChange={(event) => setNote(event.target.value)}
        />
      </div>
      <DialogFooter>
        <SecondaryButton
          type="button"
          disabled={isConfirming}
          className="rounded-full"
          onClick={onDismiss}
        >
          Keep as is
        </SecondaryButton>
        <PrimaryButton
          type="submit"
          className="rounded-full"
          disabled={isConfirming || trimmedNote.length === 0}
        >
          {isConfirming ? <Loader2 className="size-4 animate-spin" /> : null}
          Mark ready
        </PrimaryButton>
      </DialogFooter>
    </form>
  );
}
