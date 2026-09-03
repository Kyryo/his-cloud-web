"use client";

import { Bold, Italic, List, ListOrdered, Underline } from "lucide-react";
import { useEffect, useRef } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const COMMANDS = [
  { command: "bold", label: "Bold", icon: Bold },
  { command: "italic", label: "Italic", icon: Italic },
  { command: "underline", label: "Underline", icon: Underline },
  { command: "insertUnorderedList", label: "Bullet list", icon: List },
  { command: "insertOrderedList", label: "Numbered list", icon: ListOrdered },
] as const;

function focusEditorAtEnd(node: HTMLDivElement) {
  node.focus();
  const selection = window.getSelection();
  if (!selection) {
    return;
  }

  const range = document.createRange();
  range.selectNodeContents(node);
  range.collapse(false);
  selection.removeAllRanges();
  selection.addRange(range);
}

export function TherapyRichTextEditor({
  value,
  onChange,
  placeholder,
  disabled,
  readOnly = false,
  className,
  autoFocus = false,
  focusAtEndKey = 0,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  disabled?: boolean;
  readOnly?: boolean;
  className?: string;
  autoFocus?: boolean;
  focusAtEndKey?: number;
}) {
  const editorRef = useRef<HTMLDivElement>(null);
  const isInteractive = !disabled && !readOnly;

  useEffect(() => {
    if (!autoFocus) {
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      editorRef.current?.focus();
    });

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, [autoFocus]);

  useEffect(() => {
    if (!focusAtEndKey || !isInteractive) {
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      if (editorRef.current) {
        focusEditorAtEnd(editorRef.current);
      }
    });

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, [focusAtEndKey, isInteractive]);

  function runCommand(command: (typeof COMMANDS)[number]["command"]) {
    editorRef.current?.focus();
    document.execCommand(command);
    onChange(editorRef.current?.innerHTML ?? "");
  }

  return (
    <div
      className={cn(
        "w-full rounded-lg border border-transparent bg-white",
        disabled && "bg-dash-canvas/60",
        className,
      )}
    >
      <div
        className={cn(
          "flex flex-wrap gap-1 bg-white py-1.5",
          disabled && "bg-dash-canvas/60",
        )}
      >
        {COMMANDS.map(({ command, label, icon: Icon }) => (
          <Button
            key={command}
            type="button"
            variant="ghost"
            size="icon"
            className="size-8"
            disabled={!isInteractive}
            aria-label={label}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => runCommand(command)}
          >
            <Icon className="size-4" aria-hidden="true" />
          </Button>
        ))}
      </div>
      <div
        ref={(node) => {
          editorRef.current = node;
          if (node && node.innerHTML !== value) {
            node.innerHTML = value;
          }
        }}
        role="textbox"
        aria-multiline="true"
        aria-readonly={readOnly}
        contentEditable={isInteractive}
        data-placeholder={placeholder}
        className={cn(
          "min-h-64 w-full bg-white px-1 py-3 text-sm leading-6 text-brand-navy outline-none empty:before:pointer-events-none empty:before:text-brand-muted empty:before:content-[attr(data-placeholder)] [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:my-1 [&_ul]:list-disc [&_ul]:pl-5",
          !isInteractive && "cursor-default",
          disabled && "bg-dash-canvas/60 text-brand-muted",
        )}
        suppressContentEditableWarning
        onInput={(event) => {
          if (!isInteractive) {
            return;
          }
          onChange(event.currentTarget.innerHTML);
        }}
      />
    </div>
  );
}
