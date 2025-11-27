import useNibasApi from "hooks/useNibasApi";
import { routes } from "utils/routes";

type UseAuthenticationReturnType = {
  username: string | undefined;
  signOut: () => void;
} | null;

export const useAuthentication = (): UseAuthenticationReturnType => {
  const isAuthEnabled = import.meta.env.VITE_ENVIRONMENT_LOCALHOST !== "localhost";
  const { data: userInfo } = useNibasApi("/v1/auth/user");
  console.log("hei");

  return isAuthEnabled
    ? {
        username: userInfo?.username,
        // eslint-disable-next-line react-compiler/react-compiler
        signOut: () => (window.location.href = routes.logout),
      }
    : null;
};
