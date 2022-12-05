import { useRef } from "react";

const useTimer = () => {
  const timer = useRef<NodeJS.Timeout | null>(null);

  const clearTimer = () => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  };

  const startTimer = (callback: () => void, delay: number) => {
    if (timer.current) {
      clearTimer();
    }
    timer.current = setTimeout(callback, delay);
  };

  return { clearTimer, startTimer };
};

export default useTimer;
