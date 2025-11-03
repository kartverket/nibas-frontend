import useNibasApi, { getUrlWithParameters } from "hooks/useNibasApi";
import useSWRImmutable from "swr/immutable";
import { fetcherWithToken } from "utils/api";
import { StemmekretsResponse } from "../../types/api";

const stemmekretserFetcher = async ([stemmekretsIds, gyldighetsdato]: [string[], string | undefined]) => {
  const promises: Promise<StemmekretsResponse>[] = stemmekretsIds.map(async (id) =>
    fetcherWithToken([getUrlWithParameters("/v1/stemmekretser/{id}", { id, gyldighetsdato })]),
  );

  return await Promise.all(promises);
};

export const useStemmekretser = (
  stemmekretsIds: string[],
  gyldighetsdato: string | undefined,
  shouldFetch: boolean = true,
) => {
  return useSWRImmutable(
    stemmekretsIds.length > 0 && shouldFetch ? [stemmekretsIds, gyldighetsdato] : null,
    stemmekretserFetcher,
  );
};

export const useKommuneStemmekretser = (kommuneId: string | null, gyldighetsdato: string | undefined) => {
  return useNibasApi(kommuneId != null ? "/v1/kommuner/{id}/stemmekretser" : null, {
    id: kommuneId!,
    gyldighetsdato,
  });
};
