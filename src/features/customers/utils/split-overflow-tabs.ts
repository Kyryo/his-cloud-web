export function splitOverflowItems<T>({
  items,
  itemWidths,
  moreWidth,
  availableWidth,
  gap = 0,
  activeIndex,
}: {
  items: readonly T[];
  itemWidths: readonly number[];
  moreWidth: number;
  availableWidth: number;
  gap?: number;
  activeIndex: number;
}): { visible: T[]; overflow: T[] } {
  if (items.length === 0) {
    return { visible: [], overflow: [] };
  }

  const widthsAreUsable =
    itemWidths.length === items.length && itemWidths.some((width) => width > 0);

  if (availableWidth <= 0 || !widthsAreUsable) {
    return { visible: [...items], overflow: [] };
  }

  const widthOf = (indexes: number[], includeMore: boolean) => {
    if (indexes.length === 0) {
      return includeMore ? moreWidth : 0;
    }

    const itemsWidth = indexes.reduce(
      (sum, index) => sum + (itemWidths[index] ?? 0),
      0,
    );
    const itemGaps = gap * Math.max(0, indexes.length - 1);

    return includeMore
      ? itemsWidth + itemGaps + gap + moreWidth
      : itemsWidth + itemGaps;
  };

  const allIndexes = items.map((_, index) => index);
  if (widthOf(allIndexes, false) <= availableWidth) {
    return { visible: [...items], overflow: [] };
  }

  const visibleIndexes: number[] = [];

  for (let index = 0; index < items.length; index += 1) {
    const candidate = [...visibleIndexes, index];
    const remainingAfter = items.length - candidate.length;
    if (widthOf(candidate, remainingAfter > 0) <= availableWidth) {
      visibleIndexes.push(index);
    } else {
      break;
    }
  }

  const clampedActiveIndex = Math.min(
    Math.max(activeIndex, 0),
    items.length - 1,
  );

  if (!visibleIndexes.includes(clampedActiveIndex)) {
    while (visibleIndexes.length > 0) {
      const candidate = [...visibleIndexes, clampedActiveIndex].toSorted(
        (left, right) => left - right,
      );
      if (widthOf(candidate, true) <= availableWidth) {
        visibleIndexes.push(clampedActiveIndex);
        break;
      }
      visibleIndexes.pop();
    }

    if (!visibleIndexes.includes(clampedActiveIndex)) {
      visibleIndexes.push(clampedActiveIndex);
    }
  }

  const visibleSet = new Set(visibleIndexes.toSorted((left, right) => left - right));

  return {
    visible: items.filter((_, index) => visibleSet.has(index)),
    overflow: items.filter((_, index) => !visibleSet.has(index)),
  };
}
