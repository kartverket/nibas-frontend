import useNibasApi, { getUrlWithParameters } from "hooks/useNibasApi";
import useSWRImmutable from "swr/immutable";
import { fetchUrl } from "utils/api";
import { BopliktomraadeResponse } from "../../types/api";

const bopliktomraaderFetcher = async ([bopliktomraadeIds, gyldighetsdato]: [string[], string | undefined]) => {
  const promises: Promise<BopliktomraadeResponse>[] = bopliktomraadeIds.map(async (id) =>
    fetchUrl([getUrlWithParameters("/v1/bopliktomraader/{id}", { id, gyldighetsdato })]),
  );

  return await Promise.all(promises);
};

export const useBopliktomraader = (
  bopliktomraadeIds: string[],
  gyldighetsdato: string | undefined,
  shouldFetch: boolean = true,
) => {
  return useSWRImmutable(
    bopliktomraadeIds.length > 0 && shouldFetch ? [bopliktomraadeIds, gyldighetsdato] : null,
    bopliktomraaderFetcher,
  );
};

export const useKommuneBopliktomraade = (kommuneId: string | null, gyldighetsdato: string | undefined) => {
  return useNibasApi(kommuneId != null ? "/v1/kommuner/{id}/bopliktomraader" : null, {
    id: kommuneId!,
    gyldighetsdato,
  });
};
