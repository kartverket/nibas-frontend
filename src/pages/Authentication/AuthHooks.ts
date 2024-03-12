import useNibasApi from "hooks/useNibasApi";
import { SWRConfiguration } from "swr";
import { useAuthenticationFlow } from "@kartverket/frontend-aut-lib";

export enum AuthorizationStatus {
  AUTHORIZED,
  PENDING,
  NOT_AUTHORIZED,
  NOT_AUTHENTICATED,
  ERROR,
}

type AuthHookReturnValue = {
  status: AuthorizationStatus;
};

const authSwrConfig: SWRConfiguration = {
  shouldRetryOnError: false,
  revalidateIfStale: false,
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
};

export const useAuthorization = (): AuthHookReturnValue => {
  const { isAuthenticatedFunc } = useAuthenticationFlow();
  const isAuthenticated = isAuthenticatedFunc();
  const { data, error } = useNibasApi(isAuthenticated ? "/v1/authz/status" : null, undefined, authSwrConfig);

  if (!isAuthenticated) {
    return {
      status: AuthorizationStatus.NOT_AUTHENTICATED,
    };
  }

  if (data === null && error === null) {
    return {
      status: AuthorizationStatus.PENDING,
    };
  }

  if (error && error.status === 403) {
    return {
      status: AuthorizationStatus.NOT_AUTHORIZED,
    };
  }

  if (data) {
    return {
      status: AuthorizationStatus.AUTHORIZED,
    };
  }

  return {
    status: AuthorizationStatus.ERROR,
  };
};
