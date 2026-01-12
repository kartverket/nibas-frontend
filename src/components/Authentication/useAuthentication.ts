import useNibasApi from "hooks/useNibasApi";
import { routes } from "utils/routes";

type UseAuthenticationReturnType = {
  username: string | undefined;
  signOut: () => void;
} | null;

export const useAuthentication = (): UseAuthenticationReturnType => {
  const { data: userInfo } = useNibasApi("/v1/auth/user");

  return {
    username: userInfo?.username,
    // eslint-disable-next-line react-compiler/react-compiler
    signOut: () => (window.location.href = routes.logout),
  };
};
