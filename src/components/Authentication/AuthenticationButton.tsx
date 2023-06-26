import { useAuthenticationFlow } from "@kartverket/frontend-aut-lib";
import { Button } from "@kvib/react";
import Icon from "components/Icon";

/**
 * Eksempel som rendrer en login eller logout-knapp basert på om man er autentisert.
 * Henter ut isAuthenticated-funksjonen, samt login og logout-funksjonene fra useAuthenticationFlow-hook.
 */
export const AuthenticationButton = () => {
  const { isAuthenticatedFunc, handleAuthenticateFunc, handleLogoutFunc } =
    useAuthenticationFlow();

  const loginButton = (
    <Button
      variant="outline"
      aria-label="Logg inn"
      leftIcon={<Icon icon="login" aria-label="" />}
      onClick={() => handleAuthenticateFunc("/")}
    >
      Logg inn
    </Button>
  );
  const logoutButton = (
    <Button
      variant="outline"
      aria-label="Logg ut"
      leftIcon={<Icon icon="logout" aria-label="" />}
      onClick={handleLogoutFunc}
    >
      Logg ut
    </Button>
  );

  return isAuthenticatedFunc() ? logoutButton : loginButton;
};

export default AuthenticationButton;
