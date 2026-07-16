"use client";

import { useEffect } from "react";

type UseEnterEscapeShortcutsOptions = {
  /** Attach the listeners only while true (e.g. dialog open, pending edits). */
  enabled: boolean;
  /** Ignore keys while a save/submit is in flight. */
  isBusy?: boolean;
  /**
   * Skip the shortcuts while a modal dialog is open. Page-level editors should
   * set this so an open dialog's own Enter/Escape handling wins.
   */
  ignoreWhenDialogOpen?: boolean;
  /** Called on plain Enter (no modifiers). */
  onEnter?: () => unknown;
  /** Called on Escape. */
  onEscape?: () => unknown;
};

function hasOpenOverlay(): boolean {
  // Let open select menus / comboboxes / popovers handle their own keys first.
  return Boolean(
    document.querySelector('[role="listbox"]') ||
      document.querySelector("[data-radix-popper-content-wrapper]") ||
      document.querySelector('[data-slot="combobox-content"]'),
  );
}

function isMultilineTarget(target: EventTarget | null): boolean {
  return target instanceof HTMLTextAreaElement;
}

/**
 * Global Enter-to-save / Escape-to-cancel keyboard shortcuts.
 *
 * Shared by the sales order and purchase order line editors and the purchase
 * dialogs so the behavior stays identical across modules.
 */
export function useEnterEscapeShortcuts({
  enabled,
  isBusy = false,
  ignoreWhenDialogOpen = false,
  onEnter,
  onEscape,
}: UseEnterEscapeShortcutsOptions) {
  useEffect(() => {
    if (!enabled) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (isBusy) {
        return;
      }
      if (event.key !== "Enter" && event.key !== "Escape") {
        return;
      }
      if (event.isComposing) {
        return;
      }
      // A more specific handler (row input, dialog, popup) already acted.
      if (event.defaultPrevented) {
        return;
      }
      if (hasOpenOverlay()) {
        return;
      }
      if (ignoreWhenDialogOpen && document.querySelector('[role="dialog"]')) {
        return;
      }
      if (event.key === "Enter") {
        if (!onEnter) {
          return;
        }
        if (event.shiftKey || event.ctrlKey || event.metaKey || event.altKey) {
          return;
        }
        if (isMultilineTarget(event.target)) {
          return;
        }
        event.preventDefault();
        onEnter();
        return;
      }
      if (!onEscape) {
        return;
      }
      event.preventDefault();
      onEscape();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [enabled, ignoreWhenDialogOpen, isBusy, onEnter, onEscape]);
}
