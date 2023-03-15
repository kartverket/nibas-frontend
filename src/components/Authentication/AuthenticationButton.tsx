import { useAuthenticationFlow } from "@kartverket/frontend-aut-lib";
import { useTranslation } from "react-i18next";
import Button from "components/form/Button";
import Icon from "components/Icon";

/**
 * Eksempel som rendrer en login eller logout-knapp basert på om man er autentisert.
 * Henter ut isAuthenticated-funksjonen, samt login og logout-funksjonene fra useAuthenticationFlow-hook.
 */
export const AuthenticationButton = () => {
  const { isAuthenticatedFunc, handleAuthenticateFunc, handleLogoutFunc } =
    useAuthenticationFlow();

  const { t } = useTranslation();

  const loginButton = (
    <Button
      variant="secondary"
      aria-label="Logg inn"
      icon={<Icon icon="login" aria-label="" />}
      iconDirection="left"
      onClick={() => handleAuthenticateFunc("/")}
    >
      {t("auth.Login")}
    </Button>
  );
  const logoutButton = (
    <Button
      variant="secondary"
      aria-label="Logg ut"
      icon={<Icon icon="logout" aria-label="" />}
      iconDirection="left"
      onClick={handleLogoutFunc}
    >
      {t("auth.Logout")}
    </Button>
  );

  return isAuthenticatedFunc() ? logoutButton : loginButton;
};

export default AuthenticationButton;
