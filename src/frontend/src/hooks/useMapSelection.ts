import { useCallback, useEffect, useMemo, useRef, useState } from "react";

interface Selectable {
  id: bigint;
}

/**
 * Shared selection-sync state for the Map page. Selecting a marker (or a card)
 * highlights the item, reorders it to the first position in the sidebar, and
 * auto-scrolls it into view without lag. Selecting the same item again clears
 * the selection. The Map page body wires this to its markers and cards.
 */
export function useMapSelection<T extends Selectable>(items: T[]) {
  const [selectedId, setSelectedId] = useState<bigint | null>(null);
  const cardRefs = useRef<Map<string, HTMLElement>>(new Map());

  // Reorder so the selected item is first; otherwise keep the given order.
  const reordered = useMemo(() => {
    if (selectedId === null) return items;
    const selected = items.find((o) => o.id === selectedId);
    if (!selected) return items;
    return [selected, ...items.filter((o) => o.id !== selectedId)];
  }, [items, selectedId]);

  // Register/unregister a card element so it can be scrolled into view.
  const registerCardRef = useCallback((id: bigint, el: HTMLElement | null) => {
    if (el) {
      cardRefs.current.set(id.toString(), el);
    } else {
      cardRefs.current.delete(id.toString());
    }
  }, []);

  // Auto-scroll the selected card into view after the reorder has rendered.
  useEffect(() => {
    if (selectedId === null) return;
    const el = cardRefs.current.get(selectedId.toString());
    el?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [selectedId]);

  const select = useCallback((id: bigint) => {
    setSelectedId((current) => (current === id ? null : id));
  }, []);

  return { selectedId, select, reordered, registerCardRef };
}
