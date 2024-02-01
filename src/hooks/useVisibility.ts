import { useCallback, useState } from "react";

const useVisibility = (initiallyVisible = false) => {
  const [isVisible, setIsVisible] = useState(initiallyVisible);

  const show = useCallback(() => setIsVisible(true), []);
  const hide = useCallback(() => setIsVisible(false), []);

  const toggle = useCallback(() => setIsVisible((prev) => !prev), []);

  return {
    isVisible,
    show,
    hide,
    toggle,
  };
};

export default useVisibility;
