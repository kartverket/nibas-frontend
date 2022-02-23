import { useAuthenticationFlow } from "@kartverket/frontend-aut-lib";

/**
 * Eksempel som rendrer en login eller logout-knapp basert på om man er autentisert.
 * Henter ut isAuthenticated-funksjonen, samt login og logout-funksjonene fra useAuthenticationFlow-hook.
 */
export default function AuthenticationButton() {
  const { isAuthenticatedFunc, handleAuthenticateFunc, handleLogoutFunc } =
    useAuthenticationFlow();

  const loginButton = (
    <button onClick={() => handleAuthenticateFunc("/")}>Login</button>
  );
  const logoutButton = <button onClick={handleLogoutFunc}>Logout</button>;

  return isAuthenticatedFunc() ? logoutButton : loginButton;
}
