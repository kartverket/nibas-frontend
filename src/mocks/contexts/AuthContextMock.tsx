import { PropsWithChildren } from "react";
import { vitest } from "vitest";
import { AuthContext } from "react-oidc-context";

/* eslint-disable  @typescript-eslint/no-explicit-any */

const mockAuthContextValue = {
  isAuthenticated: true,
  user: null,
  clearStaleState: vitest.fn(),
  removeUser: vitest.fn(),
  signinPopup: vitest.fn(),
  signinSilent: vitest.fn(),
  signoutPopup: vitest.fn(),
  signoutSilent: vitest.fn(),
  signinRedirect: vitest.fn(),
  signoutRedirect: vitest.fn(),
  events: {} as any,
  settings: {
    authority: "",
    client_id: "",
    redirect_uri: "",
  },
};

const MockAuthProvider = ({ children }: PropsWithChildren) => {
  return <AuthContext.Provider value={mockAuthContextValue as any}>{children}</AuthContext.Provider>;
};

export { MockAuthProvider, mockAuthContextValue };
