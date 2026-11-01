"use client";

import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ROUTES } from "@/constants/routes";
import type { CatalogPricelistMembership } from "@/features/catalog/types/catalog.types";
import {
  ListPageDataTable,
  ListPageDataTableBody,
  ListPageDataTableCell,
  ListPageDataTableHeader,
  ListPageDataTableHeaderCell,
  ListPageDataTableHeaderRow,
  ListPageDataTableRow,
} from "@/features/app-shell/components/page-layout";
import {
  formatDisplayDate,
  formatInventoryAmount,
} from "@/features/inventory/utils/format-inventory";

type PricelistProductsTableProps = {
  items: CatalogPricelistMembership[];
  isTenantAdmin: boolean;
  onEditPrice: (item: CatalogPricelistMembership) => void;
  onRemove: (item: CatalogPricelistMembership) => void;
  className?: string;
};

export function PricelistProductsTable({
  items,
  isTenantAdmin,
  onEditPrice,
  onRemove,
  className,
}: PricelistProductsTableProps) {
  return (
    <ListPageDataTable className={className}>
      <ListPageDataTableHeader>
        <ListPageDataTableHeaderRow>
          <ListPageDataTableHeaderCell>Product</ListPageDataTableHeaderCell>
          <ListPageDataTableHeaderCell>Tariff code</ListPageDataTableHeaderCell>
          <ListPageDataTableHeaderCell className="text-right">
            Min qty
          </ListPageDataTableHeaderCell>
          <ListPageDataTableHeaderCell className="text-right pr-4">
            Fixed price
          </ListPageDataTableHeaderCell>
          <ListPageDataTableHeaderCell>Valid from</ListPageDataTableHeaderCell>
          <ListPageDataTableHeaderCell>Valid to</ListPageDataTableHeaderCell>
          {isTenantAdmin ? (
            <ListPageDataTableHeaderCell className="text-right pr-4">
              Actions
            </ListPageDataTableHeaderCell>
          ) : null}
        </ListPageDataTableHeaderRow>
      </ListPageDataTableHeader>
      <ListPageDataTableBody>
        {items.map((item) => (
          <ListPageDataTableRow key={item.product_uuid} className="group">
            <ListPageDataTableCell>
              <Link
                href={ROUTES.inventoryProductDetail(item.product_uuid)}
                className="block truncate font-medium text-brand-navy transition-colors group-hover:text-brand-primary"
              >
                {item.product_name ?? item.product_uuid}
              </Link>
            </ListPageDataTableCell>
            <ListPageDataTableCell className="font-mono font-medium text-brand-navy">
              {item.tariff_code?.trim() || "—"}
            </ListPageDataTableCell>
            <ListPageDataTableCell className="text-right tabular-nums text-brand-slate">
              {item.min_quantity ?? "—"}
            </ListPageDataTableCell>
            <ListPageDataTableCell className="pr-4 text-right font-medium tabular-nums text-brand-navy">
              {formatInventoryAmount(item.fixed_price)}
            </ListPageDataTableCell>
            <ListPageDataTableCell className="text-brand-slate">
              {formatDisplayDate(
                typeof item.date_start === "string" ? item.date_start : null,
              )}
            </ListPageDataTableCell>
            <ListPageDataTableCell className="text-brand-slate">
              {formatDisplayDate(
                typeof item.date_end === "string" ? item.date_end : null,
              )}
            </ListPageDataTableCell>
            {isTenantAdmin ? (
              <ListPageDataTableCell className="pr-4 text-right">
                <div
                  className="flex items-center justify-end gap-1.5"
                  onClick={(event) => event.stopPropagation()}
                >
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 rounded-md border-dash-border bg-white px-2.5 text-xs font-medium text-brand-navy hover:bg-dash-canvas"
                    onClick={() => onEditPrice(item)}
                  >
                    Edit price
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-7.5 rounded-lg text-dash-muted hover:bg-slate-100 hover:text-brand-navy"
                        aria-label={`More actions for ${item.product_name ?? "product"}`}
                      >
                        <MoreHorizontal className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44">
                      <DropdownMenuItem onClick={() => onEditPrice(item)}>
                        <Pencil className="size-4 text-amber-600" />
                        <span>Edit price</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-700 focus:text-red-700"
                        onClick={() => onRemove(item)}
                      >
                        <Trash2 className="size-4" />
                        <span>Remove</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </ListPageDataTableCell>
            ) : null}
          </ListPageDataTableRow>
        ))}
      </ListPageDataTableBody>
    </ListPageDataTable>
  );
}
