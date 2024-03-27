import { useAuth } from "react-oidc-context";
import { fetcherWithToken } from "utils/api";
import { useCallback } from "react";

type UseAuthenticationReturnType = {
  isAuthenticated: boolean;
  isLoading: boolean;
  hasError: boolean;
  token?: string;
  userId?: string;
  signIn: () => unknown;
  signOut: () => unknown;
  checkAuthorization: () => Promise<boolean>;
};

export const useAuthentication = (): UseAuthenticationReturnType => {
  const auth = useAuth();

  const checkAuthorization = useCallback(async (): Promise<boolean> => {
    if (!auth.isAuthenticated) {
      return false;
    }

    try {
      await fetcherWithToken(["/v1/authz/status", auth.user?.access_token]);
      return true;
    } catch (_) {
      return false;
    }
  }, [auth.isAuthenticated, auth.user?.access_token]);

  const { protocol, host } = window.location;
  const signOutRedirectUrl = `${protocol}//${host}/logout`;

  return {
    isAuthenticated: auth.isAuthenticated,
    isLoading: auth.isLoading,
    hasError: auth.error != null,
    token: auth.user?.access_token,
    userId: auth.user?.profile["pid"] as string | undefined,
    signIn: () => auth.signinRedirect(),
    signOut: () => auth.signoutRedirect({ post_logout_redirect_uri: signOutRedirectUrl }),
    checkAuthorization: checkAuthorization,
  };
};
