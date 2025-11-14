import useNibasApi, { getUrlWithParameters } from "../useNibasApi";
import { KommuneResponse } from "../../types/api";
import useSWRImmutable from "swr/immutable";
import { fetchUrl } from "utils/api";

const useKommuner = (
  fylkeIds: string[] | string | null = null,
  gyldighetsdato: string | undefined,
  shouldFetch = true,
) => {
  const fylkeIder: string[] | null = typeof fylkeIds === "string" ? [fylkeIds] : fylkeIds;

  const url = fylkeIder === null || fylkeIder.length < 2 ? "/v1/kommuner" : "/v1/kommuner/forFylker";

  const params =
    fylkeIder === null || fylkeIder.length < 2
      ? { gyldighetsdato, fylkeid: fylkeIder?.[0] }
      : { fylkeid: fylkeIder, gyldighetsdato };

  const { data: kommuner, ...rest } = useNibasApi(shouldFetch ? url : null, params);

  const sortedKommuner = Array.isArray(kommuner)
    ? [...kommuner].sort((a, b) => {
        return Number(a.nummer) - Number(b.nummer);
      })
    : undefined;

  return {
    kommuner: sortedKommuner,
    ...rest,
  };
};

const kommunerFetcher = async ([kommuneIds, gyldighetsdato]: [string[], string | undefined]) => {
  const promises: Promise<KommuneResponse>[] = kommuneIds.map(async (id) =>
    fetchUrl([getUrlWithParameters("/v1/kommuner/{id}", { id, gyldighetsdato })]),
  );

  return await Promise.all(promises);
};

export const useKommunerByIds = (kommuneIds: string[], gyldighetsdato: string | undefined) => {
  return useSWRImmutable(kommuneIds.length > 0 ? [kommuneIds, gyldighetsdato] : null, kommunerFetcher);
};

export const useKommune = (kommuneId: string, gyldighetsdato: string | undefined, shouldFetch = true) => {
  const { data: kommune, ...rest } = useNibasApi(shouldFetch ? "/v1/kommuner/{id}" : null, {
    id: kommuneId,
    gyldighetsdato,
  });

  return {
    kommune,
    ...rest,
  };
};

export default useKommuner;
