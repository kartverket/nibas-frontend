import { useEffect, useRef } from "react";

const usePrevious = <T extends unknown>(value: T, initialValue: T) => {
  const ref = useRef<T>(initialValue);

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
};

export default usePrevious;
