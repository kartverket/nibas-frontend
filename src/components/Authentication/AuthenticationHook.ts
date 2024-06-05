import { useAuth } from "react-oidc-context";
import { fetcherWithToken } from "utils/api";
import { useCallback } from "react";
import { isAuthDisabled, isAuthEnabled } from "components/Authentication/AuthenticationConfig";
import { ResponseError } from "ol/net";

type AuthorizationState = "OK" | "NOT_AUTHORIZED" | "ERROR";

type UseAuthenticationReturnType = {
  isAuthenticated: boolean;
  isLoading: boolean;
  hasError: boolean;
  token?: string;
  userId?: string;
  signIn: () => unknown;
  signOut: () => unknown;
  checkAuthorization: () => Promise<AuthorizationState>;
};

const isResponseError = (e: unknown): e is ResponseError => {
  return e != null && typeof e === "object" && "response" in e;
};

export const useAuthentication = (): UseAuthenticationReturnType => {
  const auth = useAuth();

  const checkAuthorization = useCallback(async (): Promise<AuthorizationState> => {
    if (isAuthDisabled()) {
      return "OK";
    }

    if (!auth.isAuthenticated) {
      return "NOT_AUTHORIZED";
    }

    try {
      await fetcherWithToken(["/v1/authz/status", auth.user?.access_token]);
      return "OK";
    } catch (e: unknown) {
      if (isResponseError(e)) {
        return (e.response.status === 401 || e.response.status) === 403 ? "NOT_AUTHORIZED" : "ERROR";
      }
      return "ERROR";
    }
  }, [auth.isAuthenticated, auth.user?.access_token]);

  const { protocol, host } = window.location;
  const signOutRedirectUrl = `${protocol}//${host}/logout`;

  const isAuthenticated = isAuthEnabled() ? auth.isAuthenticated : true;
  const userId = isAuthEnabled() ? auth.user?.profile["pid"] : "Mock-bruker";

  return {
    isAuthenticated: isAuthenticated,
    isLoading: auth.isLoading,
    hasError: auth.error != null,
    token: auth.user?.access_token,
    userId: userId as string | undefined,
    signIn: () => auth.signinRedirect(),
    signOut: () => auth.signoutRedirect({ post_logout_redirect_uri: signOutRedirectUrl }),
    checkAuthorization: checkAuthorization,
  };
};
