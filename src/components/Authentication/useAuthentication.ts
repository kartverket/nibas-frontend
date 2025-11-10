import useNibasApi from "hooks/useNibasApi";

type UseAuthenticationReturnType = {
  name: string | undefined;
};

export const useAuthentication = (): UseAuthenticationReturnType => {
  const { data: userInfo } = useNibasApi("/v1/auth/user");

  return {
    name: userInfo?.username ?? "localhost",
  };
};
