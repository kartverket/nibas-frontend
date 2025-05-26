import { getArbeidslisteUrlForPath, getArbeidslisteUrlWithParameters } from "hooks/useArbeidslisteApi";
import { fetcherWithToken } from "utils/api";
export const hentGrenselinjer = async (token: string | undefined, kommunenummer: string) => {
  const urlPath = "/api/v1/matrikkel/grenselinjer";
  const url = getArbeidslisteUrlWithParameters(urlPath, { kommunenummer });
  return fetcherWithToken([url, token]);
};

export const hentTilgjengeligeKommuner = async (token: string | undefined) => {
  const urlPath = "/api/v1/matrikkel/grenselinjer/kommuner";
  const url = getArbeidslisteUrlForPath(urlPath);
  return fetcherWithToken([url, token]);
};
