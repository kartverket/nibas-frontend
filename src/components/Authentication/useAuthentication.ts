export type AuthorizationCheckResult = "AUTHORIZED" | "NOT_AUTHORIZED" | "ERROR";

type UseAuthenticationResult = {
  token: string | undefined;
  isAuthenticated: boolean;
  isLoading: boolean;
  user: unknown;
  checkAuthorization: () => Promise<AuthorizationCheckResult>;
};

export const useAuthentication = (): UseAuthenticationResult => {
  return {
    token: undefined,
    isAuthenticated: true,
    isLoading: false,
    user: null,
    checkAuthorization: async () => "AUTHORIZED",
  };
};
