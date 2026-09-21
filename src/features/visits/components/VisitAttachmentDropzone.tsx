"use client";

import { FileText, UploadCloud, X } from "lucide-react";
import { useId, useRef, useState, type DragEvent } from "react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const ACCEPTED_EXTENSIONS = [".pdf"] as const;
const ACCEPT_ATTR = ACCEPTED_EXTENSIONS.join(",");
const MAX_BYTES = 10 * 1024 * 1024;

type VisitAttachmentDropzoneProps = {
  file: File | null;
  onFileChange: (file: File | null) => void;
  disabled?: boolean;
  error?: string | null;
  label?: string;
};

function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function isAcceptedFile(file: File): boolean {
  const name = file.name.toLowerCase();
  return ACCEPTED_EXTENSIONS.some((ext) => name.endsWith(ext));
}

export function VisitAttachmentDropzone({
  file,
  onFileChange,
  disabled = false,
  error = null,
  label = "Attachment (optional)",
}: VisitAttachmentDropzoneProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  function applyFile(next: File | null) {
    setLocalError(null);
    if (!next) {
      onFileChange(null);
      return;
    }
    if (!isAcceptedFile(next)) {
      setLocalError("Only PDF files are allowed.");
      onFileChange(null);
      return;
    }
    if (next.size > MAX_BYTES) {
      setLocalError("File exceeds the 10 MB limit.");
      onFileChange(null);
      return;
    }
    onFileChange(next);
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
    if (disabled) {
      return;
    }
    const dropped = event.dataTransfer.files?.[0] ?? null;
    applyFile(dropped);
  }

  const displayError = error || localError;

  return (
    <div className="space-y-2">
      <Label htmlFor={inputId}>{label}</Label>

      {file ? (
        <div
          className="flex items-center gap-3 rounded-xl border border-brand-border bg-slate-50/70 px-4 py-3"
          data-testid="visit-attachment-selected"
        >
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white text-brand-primary shadow-sm ring-1 ring-brand-border">
            <FileText className="size-5" aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-brand-navy">
              {file.name}
            </p>
            <p className="text-xs text-brand-muted">{formatFileSize(file.size)}</p>
          </div>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="size-8 shrink-0 rounded-full"
            disabled={disabled}
            aria-label="Remove file"
            onClick={() => {
              applyFile(null);
              if (inputRef.current) {
                inputRef.current.value = "";
              }
            }}
          >
            <X className="size-4" aria-hidden="true" />
          </Button>
        </div>
      ) : (
        <div
          role="button"
          tabIndex={disabled ? -1 : 0}
          aria-disabled={disabled}
          data-testid="visit-attachment-dropzone"
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed px-6 py-10 text-center transition-colors",
            isDragging
              ? "border-brand-primary bg-brand-primary/5"
              : "border-brand-border bg-slate-50/40 hover:border-brand-primary/50 hover:bg-slate-50",
            disabled && "pointer-events-none opacity-50",
          )}
          onDragEnter={(event) => {
            event.preventDefault();
            if (!disabled) {
              setIsDragging(true);
            }
          }}
          onDragOver={(event) => {
            event.preventDefault();
            if (!disabled) {
              setIsDragging(true);
            }
          }}
          onDragLeave={(event) => {
            event.preventDefault();
            setIsDragging(false);
          }}
          onDrop={handleDrop}
          onClick={() => {
            if (!disabled) {
              inputRef.current?.click();
            }
          }}
          onKeyDown={(event) => {
            if (disabled) {
              return;
            }
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              inputRef.current?.click();
            }
          }}
        >
          <UploadCloud className="mb-3 size-8 text-brand-primary" aria-hidden="true" />
          <p className="text-sm font-medium text-brand-navy">
            Drop a PDF here, or browse
          </p>
          <p className="mt-1 text-xs text-brand-muted">PDF only · max 10 MB</p>
        </div>
      )}

      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={ACCEPT_ATTR}
        className="sr-only"
        disabled={disabled}
        onChange={(event) => {
          applyFile(event.target.files?.[0] ?? null);
        }}
      />

      {displayError ? (
        <p className="text-sm text-destructive" data-testid="visit-attachment-error">
          {displayError}
        </p>
      ) : null}
    </div>
  );
}
