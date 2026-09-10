export type InventoryMarkKind =
  | "product"
  | "purchase-order"
  | "internal-order"
  | "adjustment"
  | "movement";

export const INVENTORY_MARK_WASHES = [
  "bg-teal-50 text-teal-700 ring-teal-200/80",
  "bg-emerald-50 text-emerald-700 ring-emerald-200/80",
  "bg-sky-50 text-sky-800 ring-sky-200/80",
  "bg-stone-100 text-stone-600 ring-stone-200/90",
] as const;

export const INVENTORY_MARK_KIND_WASH: Record<
  Exclude<InventoryMarkKind, "product">,
  string
> = {
  "purchase-order": "bg-sky-50 text-sky-800 ring-sky-200/80",
  "internal-order": "bg-indigo-50 text-indigo-700 ring-indigo-200/80",
  adjustment: "bg-amber-50 text-amber-800 ring-amber-200/80",
  movement: "bg-teal-50 text-teal-700 ring-teal-200/80",
};

export function hashInventoryMarkSeed(seed: string): number {
  let hash = 0;
  for (const char of seed) {
    hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  }
  return hash;
}

export function getInventoryMarkWash(
  kind: InventoryMarkKind,
  seed: string,
): string {
  if (kind !== "product") {
    return INVENTORY_MARK_KIND_WASH[kind];
  }

  return (
    INVENTORY_MARK_WASHES[hashInventoryMarkSeed(seed) % INVENTORY_MARK_WASHES.length] ??
    INVENTORY_MARK_WASHES[0]
  );
}
