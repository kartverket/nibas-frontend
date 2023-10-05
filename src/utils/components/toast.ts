import { UseToastOptions } from "@kvib/react";

export const createSuccessToast = (
  title: string,
  description?: string
): UseToastOptions => ({
  containerStyle: {
    marginTop: "24px",
  },
  title,
  description,
  status: "success",
  duration: 7500,
  isClosable: true,
  position: "top",
});
