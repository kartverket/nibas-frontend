import useNibasApi, { getUrlWithParameters } from "../useNibasApi";
import { FylkeResponse } from "../../types/api";
import useSWRImmutable from "swr/immutable";
import { fetchUrl } from "utils/api";

const useFylker = (gyldighetsdato: string | undefined, shouldFetch = true) => {
  const { data: fylker, ...rest } = useNibasApi(shouldFetch ? "/v1/fylker" : null, { gyldighetsdato });

  const sortedFylker = Array.isArray(fylker)
    ? [...fylker].sort((a, b) => {
        return Number(a.nummer) - Number(b.nummer);
      })
    : undefined;

  return {
    fylker: sortedFylker,
    ...rest,
  };
};

const fylkerFetcher = async ([fylkeIds, gyldighetsdato]: [string[], string | undefined]) => {
  const promises: Promise<FylkeResponse>[] = fylkeIds.map(async (id) =>
    fetchUrl([getUrlWithParameters("/v1/fylker/{id}", { id, gyldighetsdato })]),
  );

  return await Promise.all(promises);
};

export const useFylkerByIds = (fylkeIds: string[], gyldighetsdato: string | undefined) => {
  return useSWRImmutable(fylkeIds.length > 0 ? [fylkeIds, gyldighetsdato] : null, fylkerFetcher);
};

export default useFylker;
