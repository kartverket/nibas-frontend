import { useAuthentication } from "components/Authentication/AuthenticationHook";
import { useUtkast } from "contexts/UtkastContext/UtkastContext";
import { InndelingResponse } from "types/api";
import { getUrlForPath } from "utils/api";

export const useInndelingerSearch = () => {
  const auth = useAuthentication();
  const { utkast } = useUtkast();

  const searchInndelinger = async (searchString: string, limit: number): Promise<InndelingResponse[]> => {
    const gyldhetsdato = utkast?.gyldigFra;
    const formattedSearchString = searchString.replaceAll(/[.*+?%^${}()|[\]\\]/g, "");
    if (formattedSearchString.length === 0 || gyldhetsdato === undefined) {
      return [];
    }
    const encodedURI = encodeURI(
      `v1/inndelinger/?searchString=${encodeURIComponent(formattedSearchString)}&gyldighetsdato=${encodeURIComponent(gyldhetsdato)}&limit=${encodeURIComponent(limit)}`,
    );
    const results = await fetch(getUrlForPath(encodedURI), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + auth.token,
      },
    });
    return results.json();
  };

  return searchInndelinger;
};
