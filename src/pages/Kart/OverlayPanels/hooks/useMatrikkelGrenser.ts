import { getArbeidslisteUrlForPath, getArbeidslisteUrlWithParameters } from "hooks/useArbeidslisteApi";
import { fetcherWithToken } from "utils/api";
import useSWR from "swr";
import { getFeaturesFromGeoJson } from "utils/map/geoJson";

const hentGrenselinjer = async (token: string | undefined, kommunenummer: string) => {
  const urlPath = "/internal-api/api/v1/matrikkel/grenselinjer";
  const url = getArbeidslisteUrlWithParameters(urlPath, { kommunenummer });
  return fetcherWithToken([url, token]);
};

export const useMatrikkelGrenser = (shouldFetch: boolean, token: string | undefined, kommuneNummer: string) => {
  const { data, error, isLoading } = useSWR(shouldFetch ? ["matrikkelGrenser", kommuneNummer, token] : null, () =>
    hentGrenselinjer(token, kommuneNummer).then(getFeaturesFromGeoJson),
  );

  return {
    features: data ?? [],
    isLoading,
    isError: error != null,
  };
};

export const hentTilgjengeligeKommuner = async (token: string | undefined) => {
  const urlPath = "/internal-api/api/v1/matrikkel/grenselinjer/kommuner";
  const url = getArbeidslisteUrlForPath(urlPath);
  return fetcherWithToken([url, token]);
};
