import { useAuth } from "react-oidc-context";
import { User, SigninRedirectArgs, UserManagerEvents } from "oidc-client-ts";
import { fetcherWithToken } from "utils/api";
import { useCallback } from "react";
import { isAuthDisabled, isAuthEnabled } from "components/Authentication/AuthenticationConfig";

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
  checkAuthorization: () => Promise<boolean>;
  events: UserManagerEvents;
};

export const useAuthentication = (): UseAuthenticationReturnType => {
  const auth = useAuth();

  const checkAuthorization = useCallback(async (): Promise<boolean> => {
    if (isAuthDisabled()) {
      return true;
    }

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
