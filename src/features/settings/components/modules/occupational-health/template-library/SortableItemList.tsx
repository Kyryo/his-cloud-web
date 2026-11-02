"use client";

import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { useState, type ReactNode } from "react";

import { cn } from "@/lib/utils";

type SortableItemListProps<T extends { uuid: string }> = {
  items: T[];
  disabled?: boolean;
  onReorder: (orderedUuids: string[]) => void;
  renderItem: (item: T, handle: ReactNode) => ReactNode;
};

export function SortableItemList<T extends { uuid: string }>({
  items,
  disabled = false,
  onReorder,
  renderItem,
}: SortableItemListProps<T>) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );
  const [activeId, setActiveId] = useState<string | null>(null);

  function handleDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id));
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveId(null);
    const active = String(event.active.id);
    const over = event.over ? String(event.over.id) : null;
    if (!over || active === over) {
      return;
    }
    const from = items.findIndex((row) => row.uuid === active);
    const to = items.findIndex((row) => row.uuid === over);
    if (from < 0 || to < 0 || from === to) {
      return;
    }
    const next = [...items];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    onReorder(next.map((row) => row.uuid));
  }

  if (disabled || items.length < 2) {
    return (
      <ul>
        {items.map((item) => (
          <li key={item.uuid}>{renderItem(item, null)}</li>
        ))}
      </ul>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveId(null)}
    >
      <ul>
        {items.map((item) => (
          <SortableRow
            key={item.uuid}
            id={item.uuid}
            isActive={activeId === item.uuid}
            renderItem={(handle) => renderItem(item, handle)}
          />
        ))}
      </ul>
    </DndContext>
  );
}

function SortableRow({
  id,
  isActive,
  renderItem,
}: {
  id: string;
  isActive: boolean;
  renderItem: (handle: ReactNode) => ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id,
  });
  const { setNodeRef: setDropRef, isOver } = useDroppable({ id });

  return (
    <li
      ref={(node) => {
        setNodeRef(node);
        setDropRef(node);
      }}
      style={{
        transform: CSS.Translate.toString(transform),
      }}
      className={cn(
        isDragging && "opacity-70",
        isOver && !isActive && "ring-1 ring-inset ring-brand-primary/40",
      )}
    >
      {renderItem(
        <button
          type="button"
          aria-label="Drag to reorder"
          className="flex size-7 shrink-0 cursor-grab items-center justify-center rounded text-dash-muted hover:bg-slate-200/70 hover:text-brand-navy active:cursor-grabbing focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/30"
          {...listeners}
          {...attributes}
        >
          <GripVertical className="size-3.5" aria-hidden />
        </button>,
      )}
    </li>
  );
}
