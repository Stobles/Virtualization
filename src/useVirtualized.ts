import { useCallback, useLayoutEffect, useMemo, useState } from "react";
import { useDebounce } from "./useDebounce";

type TVirtualizedItem = {
  key: string;
  index: number;
  offsetTop: number;
  height: number;
};

export const useVirtualized = <T>(
  initialItems: T[],
  {
    itemHeight,
    overscan,
    scrollingDelay = 150,
    getScrollElement,
    getEstimateHeight,
    getItemKey,
  }: {
    overscan: number;
    itemHeight?: number;
    scrollingDelay?: number;
    getScrollElement: () => HTMLElement | null;
    getEstimateHeight: (index: number) => number;
    getItemKey: (index: number) => string;
  }
) => {
  const [items, setItems] = useState<T[]>(initialItems);
  const [scrollTop, setScrollTop] = useState(0);
  const [isScrolling, setIsScrolling] = useDebounce(false, { trailing: true });
  const [containerHeight, setContainerHeight] = useState(0);

  const [cachedHeight, setCachedHeight] = useState<Record<string, number>>({});

  useLayoutEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerHeight(entry.contentRect.height);
      }
    });

    const scrollEl = getScrollElement();

    if (scrollEl) resizeObserver.observe(scrollEl);

    return () => {
      if (scrollEl) resizeObserver.unobserve(scrollEl);
    };
  }, [getScrollElement]);

  useLayoutEffect(() => {
    const scrollEl = getScrollElement();

    if (!scrollEl) {
      return;
    }

    const handleScroll = () => {
      const scrollTop = scrollEl.scrollTop;

      if (!isScrolling) setIsScrolling(true, scrollingDelay);
      setScrollTop(scrollTop);

      setIsScrolling(false, scrollingDelay);
    };

    handleScroll();

    scrollEl.addEventListener("scroll", handleScroll);

    return () => scrollEl.removeEventListener("scroll", handleScroll);
  }, [getScrollElement]);

  const { virtualItems, totalHeight } = useMemo(() => {
    const getItemHeight = (index: number) => {
      if (itemHeight) return itemHeight;

      const itemKey = getItemKey(index);

      if (cachedHeight[itemKey]) return cachedHeight[itemKey];

      return getEstimateHeight(index);
    };

    const rangeStart = scrollTop;
    const rangeEnd = scrollTop + containerHeight;

    let startIndex = -1;
    let endIndex = -1;

    const allItems: TVirtualizedItem[] = new Array(items.length);

    let totalHeight = 0;

    for (let index = 0; index <= items.length; index++) {
      const row = {
        key: getItemKey(index),
        index,
        height: getItemHeight(index),
        offsetTop: totalHeight,
      };
      allItems[index] = row;

      totalHeight += row.height;

      if (startIndex === -1 && row.height + row.offsetTop > rangeStart) {
        startIndex = Math.max(0, index - overscan);
      }

      if (endIndex === -1 && row.height + row.offsetTop >= rangeEnd) {
        endIndex = Math.min(items.length - 1, index + overscan);
      }
    }

    const virtualItems = allItems.slice(startIndex, endIndex + 1);

    return { virtualItems, allItems, totalHeight };
  }, [scrollTop, items.length, containerHeight, cachedHeight]);

  const measureHeightRef = useCallback((el: HTMLElement | null) => {
    if (!el) return;

    const indexString = el.getAttribute("data-index") || "";
    const index = parseInt(indexString, 10);

    if (Number.isNaN(index)) {
      throw new Error(
        "You must provide a data-index attribute. Index of an element must be a number"
      );
    }

    const itemKey = getItemKey(index);
    const itemHeight = el.getBoundingClientRect().height;

    setCachedHeight((prevHeight) => ({ ...prevHeight, [itemKey]: itemHeight }));
  }, []);

  return {
    virtualItems,
    totalHeight,
    measureHeightRef,
    setItems,
  };
};
