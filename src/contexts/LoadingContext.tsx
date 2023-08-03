import React, { createContext, useContext, useState } from "react";

export type LoadingContextValue = {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
};

export const LoadingContext = createContext<LoadingContextValue | undefined>(
  undefined
);

export const LoadingProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const value = {
    isLoading,
    setIsLoading,
  };

  return (
    <LoadingContext.Provider value={value}>{children}</LoadingContext.Provider>
  );
};

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error("useLoading must be used within a LoadingContext");
  }

  return context;
};
