import { useAuth } from "react-oidc-context";
import { User, SigninRedirectArgs, UserManagerEvents } from "oidc-client-ts";
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
  signIn: (args?: SigninRedirectArgs) => unknown;
  clear: () => void;
  signOut: () => unknown;
  user?: User | null;
  events: UserManagerEvents;
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
    events: auth.events,
    isAuthenticated: isAuthenticated,
    isLoading: auth.isLoading,
    hasError: auth.error != null,
    clear: () => auth.removeUser(),
    user: auth.user,
    token: auth.user?.access_token,
    userId: userId as string | undefined,
    signIn: (args?: SigninRedirectArgs) => auth.signinRedirect(args),
    signOut: () => auth.signoutRedirect({ post_logout_redirect_uri: signOutRedirectUrl }),
    checkAuthorization: checkAuthorization,
  };
};
