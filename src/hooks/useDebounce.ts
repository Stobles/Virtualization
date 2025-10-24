import { useState } from "react";

export const useDebounce = <T>(
  initialValue: T,
  options: { trailing: boolean } = { trailing: false }
) => {
  const [value, setValue] = useState<T>(initialValue);

  let timeoutId: number | null = null;

  const setDebouncedValue = (value: T, delay: number) => {
    if (options.trailing && !timeoutId) setValue(value);

    if (timeoutId) clearTimeout(timeoutId);

    timeoutId = setTimeout(() => {
      setValue(value);
      timeoutId = null;
    }, delay);
  };

  return [value, setDebouncedValue] as const;
};
