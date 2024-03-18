import { UseToastOptions, useToast } from "@kvib/react";
import { useRef } from "react";

const useToastUnique = (options: UseToastOptions) => {
  const toast = useToast({});
  const toastIdRef = useRef<string | number>();

  const toastUnique = (): void => {
    if (toastIdRef.current == null) {
      toastIdRef.current = toast(options);
    } else {
      if (!toast.isActive(toastIdRef.current)) {
        toastIdRef.current = toast(options);
      }
    }
  };

  return {
    toastUnique,
  };
};

export default useToastUnique;
