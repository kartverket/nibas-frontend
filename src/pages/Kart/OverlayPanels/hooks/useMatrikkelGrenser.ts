import { getArbeidslisteUrlForPath, getArbeidslisteUrlWithParameters } from "hooks/useArbeidslisteApi";
import { fetcherWithToken } from "utils/api";
import useSWR from "swr";
import { getFeaturesFromGeoJson } from "utils/map/geoJson";

const hentGrenselinjer = async (kommunenummer: string) => {
  const urlPath = "/api/v1/matrikkel/grenselinjer";
  const url = getArbeidslisteUrlWithParameters(urlPath, { kommunenummer });
  return fetcherWithToken([url]);
};

export const useMatrikkelGrenser = (kommuneNummer: string) => {
  const { data, error, isLoading } = useSWR(
    kommuneNummer != null ? ["matrikkelGrenser", kommuneNummer] : null,
    () => hentGrenselinjer(kommuneNummer).then(getFeaturesFromGeoJson),
  );

  return {
    features: data ?? [],
    isLoading,
    isError: error != null,
  };
};

export const hentTilgjengeligeKommuner = async () => {
  const urlPath = "/api/v1/matrikkel/grenselinjer/kommuner";
  const url = getArbeidslisteUrlForPath(urlPath);
  return fetcherWithToken([url]);
};
