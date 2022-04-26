import { useAuthenticationFlow } from "@kartverket/frontend-aut-lib";
import { useTranslation } from "react-i18next";

/**
 * Eksempel som rendrer en login eller logout-knapp basert på om man er autentisert.
 * Henter ut isAuthenticated-funksjonen, samt login og logout-funksjonene fra useAuthenticationFlow-hook.
 */
export default function AuthenticationButton() {
  const { isAuthenticatedFunc, handleAuthenticateFunc, handleLogoutFunc } =
    useAuthenticationFlow();

  const { t } = useTranslation();

  const loginButton = (
    <button onClick={() => handleAuthenticateFunc("/")}>
      {t("auth.Login")}
    </button>
  );
  const logoutButton = (
    <button onClick={handleLogoutFunc}>{t("auth.Logout")}</button>
  );

  return isAuthenticatedFunc() ? logoutButton : loginButton;
}
