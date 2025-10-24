import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { useDebounce } from "./useDebounce";

export const useVirtualized = <T>(
  initialItems: T[],
  {
    containerHeight,
    itemHeight,
    overscan,
  }: { containerHeight: number; itemHeight: number; overscan: number }
) => {
  const [items, setItems] = useState<T[]>(initialItems);
  const [scrollTop, setScrollTop] = useState(0);
  const [isScrolling, setIsScrolling] = useDebounce(false, { trailing: true });

  const scrollElementRef = useRef<HTMLUListElement | null>(null);

  const virtualItems = useMemo(() => {
    const rangeStart = scrollTop;
    const rangeEnd = scrollTop + containerHeight;

    let startIndex = Math.floor(rangeStart / itemHeight);
    let endIndex = Math.ceil(rangeEnd / itemHeight);

    startIndex = Math.max(0, startIndex - overscan);
    endIndex = Math.min(items.length - 1, endIndex + overscan);

    const virtualItems = [];

    for (let i = startIndex; i <= endIndex; i++) {
      virtualItems.push({
        item: items[i] as T,
        offsetTop: i * itemHeight,
      });
    }

    return virtualItems;
  }, [scrollTop, items.length]);

  const totalListHeight = itemHeight * items.length;

  useLayoutEffect(() => {
    const scrollRef = scrollElementRef.current;

    if (!scrollRef) {
      return;
    }

    const handleScroll = () => {
      const scrollTop = scrollRef.scrollTop;

      if (!isScrolling) setIsScrolling(true, 50);

      setScrollTop(scrollTop);

      setIsScrolling(false, 150);
    };

    handleScroll();

    scrollRef.addEventListener("scroll", handleScroll);

    return () => scrollRef.removeEventListener("scroll", handleScroll);
  }, []);

  return { virtualItems, totalListHeight, scrollElementRef, setItems };
};
