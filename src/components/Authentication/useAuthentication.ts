import useNibasApi from "hooks/useNibasApi";
import { useNavigate } from "react-router-dom";
import { routes } from "utils/routes";

type UseAuthenticationReturnType = {
  username: string | undefined;
  signOut: () => void;
};

export const useAuthentication = (): UseAuthenticationReturnType => {
  const { data: userInfo } = useNibasApi("/v1/auth/user");
  const navigate = useNavigate();

  return {
    username: userInfo?.username ?? "localhost",
    signOut: () => navigate(routes.logout),
  };
};
