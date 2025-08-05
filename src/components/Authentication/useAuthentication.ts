import { isAuthDisabled, isAuthEnabled, isMockAuthEnabled } from "components/Authentication/AuthenticationConfig";
import { SigninRedirectArgs, User, UserManagerEvents } from "oidc-client-ts";
import { ResponseError } from "ol/net";
import { useAuth } from "react-oidc-context";
import { fetcherWithToken } from "utils/api";

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

  const checkAuthorization = async (): Promise<AuthorizationState> => {
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
  };

  const { protocol, host } = window.location;
  const signOutRedirectUrl = `${protocol}//${host}/logout`;

  const isAuthenticated = isAuthEnabled() ? auth.isAuthenticated : window.location.pathname === "/auth" ? false : true;
  const userId = isAuthEnabled()
    ? isMockAuthEnabled()
      ? auth.user?.profile.sub
      : auth.user?.profile["pid"]
    : "Mock-bruker";

  return {
    events: auth.events,
    isAuthenticated: isAuthenticated,
    isLoading: auth.isLoading,
    hasError: auth.error != null,
    clear: () => auth.removeUser(),
    user: auth.user,
    token: auth.user?.access_token,
    userId: userId as string | undefined,
    signIn: isAuthEnabled()
      ? (args?: SigninRedirectArgs) => auth.signinRedirect(args)
      : () => window.location.replace("/authenticated"),
    signOut: isAuthEnabled()
      ? () => auth.signoutRedirect({ post_logout_redirect_uri: signOutRedirectUrl })
      : () => window.location.replace("/auth"),
    checkAuthorization: checkAuthorization,
  };
};
