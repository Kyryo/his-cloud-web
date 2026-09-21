"use client";

import { Download, FileText, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  encounterAttachmentDownloadUrl,
  fetchInvoiceAttachments,
} from "@/features/visits/services/visit-attachments.service";
import type { VisitEncounterAttachment } from "@/features/visits/types/visit-attachment.types";

function formatFileSize(bytes: number | null): string {
  if (bytes == null) {
    return "—";
  }
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

type InvoiceDetailAttachmentsTabProps = {
  invoiceId: number | string;
  isActive: boolean;
};

export function InvoiceDetailAttachmentsTab({
  invoiceId,
  isActive,
}: InvoiceDetailAttachmentsTabProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [attachments, setAttachments] = useState<VisitEncounterAttachment[]>([]);

  useEffect(() => {
    if (!isActive) {
      return;
    }
    let cancelled = false;
    async function load() {
      setIsLoading(true);
      try {
        const response = await fetchInvoiceAttachments(invoiceId);
        if (!cancelled) {
          setAttachments(response.results ?? []);
        }
      } catch {
        if (!cancelled) {
          setAttachments([]);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [isActive, invoiceId]);

  if (!isActive) {
    return null;
  }

  if (isLoading) {
    return (
      <div
        className="flex items-center gap-2 py-8 text-sm text-dash-muted"
        data-testid="invoice-attachments-loading"
      >
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        Loading attachments…
      </div>
    );
  }

  if (attachments.length === 0) {
    return (
      <div className="py-10 text-center" data-testid="invoice-attachments-empty">
        <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-brand-tint text-brand-primary">
          <FileText className="size-6" aria-hidden="true" />
        </div>
        <h3 className="mt-4 text-base font-semibold text-brand-navy">
          No attachments
        </h3>
        <p className="mt-2 text-sm text-dash-muted">
          Encounter documents attached at visit start will appear here.
        </p>
      </div>
    );
  }

  return (
    <ul className="space-y-3" data-testid="invoice-attachments">
      {attachments.map((attachment) => (
        <li
          key={attachment.uuid}
          className="flex items-center gap-3 rounded-xl border border-brand-border bg-slate-50/50 px-4 py-3"
        >
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white text-brand-primary shadow-sm ring-1 ring-brand-border">
            <FileText className="size-5" aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-brand-navy">
              {attachment.file_name}
            </p>
            <p className="text-xs text-brand-muted">
              {formatFileSize(attachment.file_size)}
            </p>
          </div>
          <Button type="button" size="sm" variant="outline" asChild>
            <a
              href={encounterAttachmentDownloadUrl(
                attachment.encounter_uuid,
                attachment.uuid,
              )}
              download={attachment.file_name}
            >
              <Download className="size-4" aria-hidden="true" />
              Download
            </a>
          </Button>
        </li>
      ))}
    </ul>
  );
}
