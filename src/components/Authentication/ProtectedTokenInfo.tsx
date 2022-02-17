import { useEffect } from "react";
import { useAuthenticationFlow } from "@kartverket/frontend-aut-lib";

export default function ProtectedTokenInfo(): JSX.Element {
  /**
   * Henter ut disse 3 elementene fra hook'n, se bruk lenger ned
   */
  const { isAuthenticatedFunc, handleAuthenticateFunc, tokenHolderFunc } =
    useAuthenticationFlow();

  useEffect(() => {
    /**
     * Sjekk først om man er autentisert. Hvis ikke, initialiser autentiseringsflyt
     */
    if (!isAuthenticatedFunc()) {
      handleAuthenticateFunc("/protectedTokenInfo");
    }
  }, [isAuthenticatedFunc, handleAuthenticateFunc, tokenHolderFunc]);

  /**
   * Hvis man er autentisert, vi informasjon om token og person-id
   */
  const authenticatedJSX = (
    <div>
      <h2>Du er logget inn</h2>
      <p>Token: {tokenHolderFunc()?.token}</p>
    </div>
  );

  const notAuthenticatedJSX = <h1>Avventer pålogging</h1>;

  /**
   * Rendre innhold basert på om man er autentisert
   */
  return isAuthenticatedFunc() ? authenticatedJSX : notAuthenticatedJSX;
}
