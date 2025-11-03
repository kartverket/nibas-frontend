import React, { createContext, useContext, useState } from "react";

type AuthRenewContextValue = {
  authRenewError: boolean;
  setAuthRenewError: (value: boolean) => void;
};

const AuthRenewContext = createContext<AuthRenewContextValue | undefined>(undefined);

export const AuthRenewProvider = ({ children }: { children: React.ReactNode }) => {
  const [authRenewError, setAuthRenewError] = useState(false);
  return <AuthRenewContext.Provider value={{ authRenewError, setAuthRenewError }}>{children}</AuthRenewContext.Provider>;
};

export const useAuthRenewError = () => {
  const ctx = useContext(AuthRenewContext);
  if (ctx == null) {
    throw new Error("useAuthRenewError must be used within AuthRenewProvider");
  }
  return ctx;
};

export const AuthRenewError = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};


