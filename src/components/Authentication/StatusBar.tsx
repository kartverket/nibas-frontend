import { useAuthenticationFlow } from "@kartverket/frontend-aut-lib";

/**
 * StatusBar som bruker isAuthenticated-funksjonen, samt henter ut person-id fra tokenHolder hvis man er autentisert.
 * @constructor
 */
export default function StatusBar() {
  const { isAuthenticatedFunc, tokenHolderFunc } = useAuthenticationFlow();

  const notAuthenticatedJSX = (
    <div>
      <h1>Not Authenticated</h1>
    </div>
  );

  const authenticatedJSX = (
    <div>
      <h2>User {tokenHolderFunc()?.personId} logged in.</h2>
    </div>
  );

  return isAuthenticatedFunc() ? authenticatedJSX : notAuthenticatedJSX;
}
