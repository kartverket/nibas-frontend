import { useAuthenticationFlow } from "@kartverket/frontend-aut-lib";
import { useTranslation } from "react-i18next";
import Button from "components/form/Button";

/**
 * Eksempel som rendrer en login eller logout-knapp basert på om man er autentisert.
 * Henter ut isAuthenticated-funksjonen, samt login og logout-funksjonene fra useAuthenticationFlow-hook.
 */
export default function AuthenticationButton() {
  const { isAuthenticatedFunc, handleAuthenticateFunc, handleLogoutFunc } =
    useAuthenticationFlow();

  const { t } = useTranslation();

  const loginButton = (
    <Button onClick={() => handleAuthenticateFunc("/")}>
      {t("auth.Login")}
    </Button>
  );
  const logoutButton = (
    <Button onClick={handleLogoutFunc}>{t("auth.Logout")}</Button>
  );

  return isAuthenticatedFunc() ? logoutButton : loginButton;
}
