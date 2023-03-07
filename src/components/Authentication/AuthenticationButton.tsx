import { useAuthenticationFlow } from "@kartverket/frontend-aut-lib";
import { useTranslation } from "react-i18next";
import Button from "components/form/Button";

/**
 * Eksempel som rendrer en login eller logout-knapp basert på om man er autentisert.
 * Henter ut isAuthenticated-funksjonen, samt login og logout-funksjonene fra useAuthenticationFlow-hook.
 */
export const AuthenticationButton = () => {
  const { isAuthenticatedFunc, handleAuthenticateFunc, handleLogoutFunc } =
    useAuthenticationFlow();

  const { t } = useTranslation();

  const loginButton = (
    <Button onClick={() => handleAuthenticateFunc("/") } variant="secondary" icon="login" iconDirection="left">
      {t("auth.Login")}
    </Button>
  );
  const logoutButton = (
    <Button onClick={handleLogoutFunc} variant="secondary" icon="logout" iconDirection="left">{t("auth.Logout")}</Button>
  );
  

  return isAuthenticatedFunc() ? logoutButton : loginButton;
};

export default AuthenticationButton;
