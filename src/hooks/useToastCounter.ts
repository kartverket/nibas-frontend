import { useToast } from "@kvib/react";
import { useRef, useState } from "react";

type ToastStatus = "info" | "warning" | "error" | "success";

const useToastCounter = (status: ToastStatus, singlarDescription: string, pluralDescription: string) => {
  const toast = useToast();
  const [count, setCount] = useState(0);
  const toastIdRef = useRef<string | number>("");

  const toastCounter = (): void => {
    if (count > 0 && toast.isActive(toastIdRef.current)) {
      toast.close(toastIdRef.current);
      toastIdRef.current = toast({ status: status, description: `${count + 1} ${pluralDescription}` });
      setCount(count + 1);
      return;
    }

    toastIdRef.current = toast({ status: status, description: `${singlarDescription}` });
    setCount(1);
    return;
  };

  return {
    toastCounter,
  };
};

export default useToastCounter;
