"use client";

import { Bold, Italic, List, ListOrdered, Underline } from "lucide-react";
import { useRef } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const COMMANDS = [
  { command: "bold", label: "Bold", icon: Bold },
  { command: "italic", label: "Italic", icon: Italic },
  { command: "underline", label: "Underline", icon: Underline },
  { command: "insertUnorderedList", label: "Bullet list", icon: List },
  { command: "insertOrderedList", label: "Numbered list", icon: ListOrdered },
] as const;

export function TherapyRichTextEditor({
  value,
  onChange,
  placeholder,
  disabled,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  disabled?: boolean;
  className?: string;
}) {
  const editorRef = useRef<HTMLDivElement>(null);

  function runCommand(command: (typeof COMMANDS)[number]["command"]) {
    editorRef.current?.focus();
    document.execCommand(command);
    onChange(editorRef.current?.innerHTML ?? "");
  }

  return (
    <div
      className={cn(
        "w-full bg-white",
        className,
      )}
    >
      <div className="flex flex-wrap gap-1 bg-white py-1.5">
        {COMMANDS.map(({ command, label, icon: Icon }) => (
          <Button
            key={command}
            type="button"
            variant="ghost"
            size="icon"
            className="size-8"
            disabled={disabled}
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
        contentEditable={!disabled}
        data-placeholder={placeholder}
        className="min-h-64 w-full bg-white px-1 py-3 text-sm leading-6 text-brand-navy outline-none empty:before:pointer-events-none empty:before:text-brand-muted empty:before:content-[attr(data-placeholder)] [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:my-1 [&_ul]:list-disc [&_ul]:pl-5"
        suppressContentEditableWarning
        onInput={(event) => onChange(event.currentTarget.innerHTML)}
      />
    </div>
  );
}
