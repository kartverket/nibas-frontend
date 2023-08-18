import { UseToastOptions } from "@kvib/react";

export const createSuccessToast = (
  title: string,
  description?: string
): UseToastOptions => ({
  containerStyle: {
    margin: "30px",
  },
  title,
  description,
  status: "success",
  duration: 9000,
  isClosable: true,
  position: "top",
});
