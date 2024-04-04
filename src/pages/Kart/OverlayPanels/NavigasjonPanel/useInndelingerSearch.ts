import { useAuthenticationFlow } from "@kartverket/frontend-aut-lib";
import { useUtkast } from "contexts/UtkastContext/UtkastContext";
import { InndelingResponse } from "types/api";
import { getUrlForPath } from "utils/api";

export const useInndelingerSearch = () => {
  const { tokenHolderFunc } = useAuthenticationFlow();
  const { utkast } = useUtkast();

  const searchInndelinger = async (searchString: string, limit: number): Promise<InndelingResponse[]> => {
    const gyldhetsdato = utkast?.gyldigFra;
    const results = await fetch(
      getUrlForPath(`v1/inndelinger/?searchString=${searchString}&gyldighetsdato=${gyldhetsdato}&limit=${limit}`),
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + tokenHolderFunc()?.token,
        },
      },
    );
    return results.json();
  };

  return searchInndelinger;
};
