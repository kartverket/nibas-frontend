import useNibasApi, { getUrlWithParameters } from "../useNibasApi";
import { FylkeResponse } from "../../types/api";
import { useAuthentication } from "components/Authentication/AuthenticationHook";
import useSWRImmutable from "swr/immutable";
import { fetcherWithToken } from "utils/api";

const useFylker = (gyldighetsdato: string | undefined, shouldFetch = true) => {
  const { data: fylker, ...rest } = useNibasApi(shouldFetch ? "/v1/fylker" : null, { gyldighetsdato });

  const sortedFylker = fylker?.sort((a, b) => {
    return Number(a.nummer) - Number(b.nummer);
  });

  return {
    fylker: sortedFylker,
    ...rest,
  };
};

const fylkerFetcher = async ([fylkeIds, gyldighetsdato, token]: [string[], string | undefined, string | undefined]) => {
  const promises: Promise<FylkeResponse>[] = fylkeIds.map(async (id) =>
    fetcherWithToken([getUrlWithParameters("/v1/fylker/{id}", { id, gyldighetsdato }), token]),
  );

  return await Promise.all(promises);
};

export const useFylkerByIds = (fylkeIds: string[], gyldighetsdato: string | undefined) => {
  const { token } = useAuthentication();

  return useSWRImmutable(fylkeIds.length > 0 ? [fylkeIds, gyldighetsdato, token] : null, fylkerFetcher);
};

export default useFylker;
