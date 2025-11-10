import { getArbeidslisteUrlForPath, getArbeidslisteUrlWithParameters } from "hooks/useArbeidslisteApi";
import { fetchUrl } from "utils/api";
import useSWR from "swr";
import { getFeaturesFromGeoJson } from "utils/map/geoJson";

const hentGrenselinjer = async (kommunenummer: string) => {
  const urlPath = "/internal-api/api/v1/matrikkel/grenselinjer";
  const url = getArbeidslisteUrlWithParameters(urlPath, { kommunenummer });
  return fetchUrl([url]);
};

export const useMatrikkelGrenser = (shouldFetch: boolean, kommuneNummer: string) => {
  const { data, error, isLoading } = useSWR(shouldFetch ? ["matrikkelGrenser", kommuneNummer] : null, () =>
    hentGrenselinjer(kommuneNummer).then(getFeaturesFromGeoJson),
  );

  return {
    features: data ?? [],
    isLoading,
    isError: error != null,
  };
};

export const hentTilgjengeligeKommuner = async () => {
  const urlPath = "/internal-api/api/v1/matrikkel/grenselinjer/kommuner";
  const url = getArbeidslisteUrlForPath(urlPath);
  return fetchUrl([url]);
};
