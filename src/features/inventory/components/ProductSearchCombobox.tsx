"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { searchInventoryProducts } from "@/features/inventory/services/inventory.service";
import type { InventoryProduct } from "@/features/inventory/types/inventory.types";
import { formatProductLabel } from "@/features/inventory/utils/format-inventory";
import { cn } from "@/lib/utils";

type ProductSearchComboboxProps = {
  id?: string;
  label?: string;
  value?: string | null;
  onSelect: (product: InventoryProduct) => void;
  disabled?: boolean;
  placeholder?: string;
};

export function ProductSearchCombobox({
  id = "product-search",
  label = "Product",
  value,
  onSelect,
  disabled = false,
  placeholder = "Search products...",
}: ProductSearchComboboxProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<InventoryProduct[]>([]);
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!value) {
      setSelectedLabel(null);
      return;
    }

    let cancelled = false;

    void (async () => {
      try {
        const products = await searchInventoryProducts({ active: true });
        const match = products.find((product) => product.uuid === value);
        if (!cancelled && match) {
          setSelectedLabel(formatProductLabel(match));
        }
      } catch {
        if (!cancelled) {
          setSelectedLabel(`Product ${value.slice(0, 8)}…`);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [value]);

  useEffect(() => {
    if (query.trim().length < 2) {
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
          setIsOpen(true);
        } catch {
          setResults([]);
        } finally {
          setIsSearching(false);
        }
      })();
    }, 300);

    return () => window.clearTimeout(handle);
  }, [query]);

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

  function handleSelect(product: InventoryProduct) {
    onSelect(product);
    setSelectedLabel(formatProductLabel(product));
    setQuery("");
    setResults([]);
    setIsOpen(false);
  }

  const displayValue = isOpen ? query : selectedLabel ?? query;

  return (
    <div ref={containerRef} className="relative space-y-2">
      {label ? <Label htmlFor={id}>{label}</Label> : null}
      <div className="relative">
        <Input
          id={id}
          type="search"
          value={displayValue}
          placeholder={placeholder}
          disabled={disabled}
          onChange={(event) => {
            setQuery(event.target.value);
            setSelectedLabel(null);
            setIsOpen(true);
          }}
          onFocus={() => {
            if (query.trim().length >= 2) {
              setIsOpen(true);
            }
          }}
        />
        {isSearching ? (
          <Loader2
            className="absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-brand-muted"
            aria-hidden="true"
          />
        ) : null}
      </div>
      {isOpen && results.length > 0 ? (
        <ul
          className={cn(
            "absolute z-50 mt-1 max-h-56 w-full overflow-auto rounded-xl border border-brand-border bg-white py-1",
          )}
        >
          {results.map((product) => (
            <li key={product.uuid}>
              <button
                type="button"
                className="w-full px-3 py-2 text-left text-sm text-brand-navy hover:bg-slate-50"
                onClick={() => handleSelect(product)}
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
