import useNibasApi from "hooks/useNibasApi";
import { useNavigate } from "react-router-dom";
import { routes } from "utils/routes";

type UseAuthenticationReturnType = {
  username: string | undefined;
  signOut: () => void;
} | null;

export const useAuthentication = (): UseAuthenticationReturnType => {
  const isAuthEnabled = import.meta.env.VITE_ENVIRONMENT_LOCALHOST !== "localhost";
  const { data: userInfo } = useNibasApi("/v1/auth/user");
  const navigate = useNavigate();

  return isAuthEnabled
    ? {
        username: userInfo?.username,
        signOut: () => navigate(routes.logout, { replace: true }),
      }
    : null;
};
