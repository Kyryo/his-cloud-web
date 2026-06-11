"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Input } from "@/components/ui/input";
import { searchInventoryProducts } from "@/features/inventory/services/inventory.service";
import type { InventoryProduct } from "@/features/inventory/types/inventory.types";
import { formatProductLabel } from "@/features/inventory/utils/format-inventory";
import { cn } from "@/lib/utils";

type InlineProductSearchInputProps = {
  id: string;
  value: number | null;
  displayLabel?: string | null;
  disabled?: boolean;
  autoFocus?: boolean;
  onSelect: (product: InventoryProduct) => void;
  onFocus?: () => void;
  onKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
};

export function InlineProductSearchInput({
  id,
  value,
  displayLabel,
  disabled = false,
  autoFocus = false,
  onSelect,
  onFocus,
  onKeyDown,
}: InlineProductSearchInputProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<InventoryProduct[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen || query.trim().length < 2) {
      setResults([]);
      return;
    }

    const handle = window.setTimeout(() => {
      void (async () => {
        setIsSearching(true);
        try {
          const products = await searchInventoryProducts({
            q: query.trim(),
            active: true,
          });
          setResults(products);
        } catch {
          setResults([]);
        } finally {
          setIsSearching(false);
        }
      })();
    }, 250);

    return () => window.clearTimeout(handle);
  }, [isOpen, query]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const displayValue = isOpen ? query : displayLabel ?? "";

  return (
    <div ref={containerRef} className="relative min-w-[12rem]">
      <Input
        id={id}
        type="search"
        value={displayValue}
        disabled={disabled}
        autoFocus={autoFocus}
        placeholder="Search products..."
        className="h-9 border-brand-border/80 bg-white"
        onChange={(event) => {
          setQuery(event.target.value);
          setIsOpen(true);
        }}
        onFocus={() => {
          setIsOpen(true);
          onFocus?.();
        }}
        onKeyDown={onKeyDown}
      />
      {isSearching ? (
        <Loader2
          className="absolute right-2 top-1/2 size-4 -translate-y-1/2 animate-spin text-brand-muted"
          aria-hidden="true"
        />
      ) : null}
      {isOpen && results.length > 0 ? (
        <ul className="absolute z-50 mt-1 max-h-52 w-full min-w-[16rem] overflow-auto rounded-xl border border-brand-border bg-white py-1 shadow-lg">
          {results.map((product) => (
            <li key={product.id}>
              <button
                type="button"
                className={cn(
                  "w-full px-3 py-2 text-left text-sm text-brand-navy hover:bg-sky-50",
                  value === product.id && "bg-sky-50/80",
                )}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  onSelect(product);
                  setQuery("");
                  setResults([]);
                  setIsOpen(false);
                }}
              >
                {formatProductLabel(product)}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
