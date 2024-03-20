import { UseToastOptions, useToast } from "@kvib/react";
import { useRef, useState } from "react";

const useToastCounter = (options: UseToastOptions, singularDescription: string, pluralDescription: string) => {
  const toast = useToast();
  const [count, setCount] = useState(0);
  const toastIdRef = useRef<string | number>("");

  const toastCounter = (): void => {
    if (count > 0 && toast.isActive(toastIdRef.current)) {
      toast.close(toastIdRef.current);
      toastIdRef.current = toast({ ...options, description: `${count + 1} ${pluralDescription}` });
      setCount(count + 1);
      return;
    }

    toastIdRef.current = toast({ ...options, description: `${singularDescription}` });
    setCount(1);
    return;
  };

  return {
    toastCounter,
  };
};

export default useToastCounter;
