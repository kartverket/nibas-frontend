import { useAuthenticationFlow } from "@kartverket/frontend-aut-lib";
import useSWRImmutable from "swr/immutable";
import { FylkeResponse } from "types/api";
import { fetcherWithToken, getIdFromEntity } from "utils/api";
import useNibasApi from "../useNibasApi";

const fylkerFetcher = async ([fylkePaths, token]: [string[], string | undefined]) => {
  const promises: Promise<FylkeResponse>[] = fylkePaths.map(async (path) => fetcherWithToken([path, token]));

  return await Promise.all(promises);
};

export const useFylkerResponse = (shouldFetch = true) => {
  const { tokenHolderFunc } = useAuthenticationFlow();

  const { data: fylkerRefs, ...rest } = useNibasApi(shouldFetch ? "/v1/fylker" : null);

  const fylkeIds = fylkerRefs?.map(getIdFromEntity) ?? [];
  const fylkeIdsPath = fylkeIds.map((id) => `/v1/fylker/${id}`);

  const { data: fylkerResponse } = useSWRImmutable(
    fylkeIds && fylkeIds.length > 0 ? [fylkeIdsPath, tokenHolderFunc()?.token] : null,
    fylkerFetcher,
  );

  const sortedFylker = fylkerResponse?.sort((a, b) => {
    return Number(a.fylkesnummer.kodeverdi) - Number(b.fylkesnummer.kodeverdi);
  });

  return {
    fylker: sortedFylker,
    ...rest,
  };
};

const useFylker = (shouldFetch = true) => {
  const { data: fylker, ...rest } = useNibasApi(shouldFetch ? "/v1/fylker" : null);

  const sortedFylker = fylker?.sort((a, b) => {
    return Number(a.fylkesnummer.kodeverdi) - Number(b.fylkesnummer.kodeverdi);
  });

  return {
    fylker: sortedFylker,
    ...rest,
  };
};

export default useFylker;
