import { KommuneResponse } from "types/api";
import useNibasApi from "../useNibasApi";
import { fetcherWithToken, getIdFromEntity } from "utils/api";
import { useAuthenticationFlow } from "@kartverket/frontend-aut-lib";
import useSWRImmutable from "swr/immutable";

const kommunerFetcher = async ([kommunePaths, token]: [string[], string | undefined]) => {
  const promises: Promise<KommuneResponse>[] = kommunePaths.map(async (path) => fetcherWithToken([path, token]));

  return await Promise.all(promises);
};

export const useKommunerResponse = (fylkeId: string, shouldFetch = true) => {
  const { tokenHolderFunc } = useAuthenticationFlow();

  const { data: kommunerRefs, ...rest } = useNibasApi(shouldFetch ? "/v1/kommuner" : null, {
    fylkeid: fylkeId,
  });

  const kommuneIds = kommunerRefs?.map(getIdFromEntity) ?? [];
  const kommuneIdsPath = kommuneIds.map((id) => `/v1/kommuner/${id}`);

  const { data: kommunerResponse } = useSWRImmutable(
    kommuneIds && kommuneIds.length > 0 ? [kommuneIdsPath, tokenHolderFunc()?.token] : null,
    kommunerFetcher,
  );

  const sortedKommuner = kommunerResponse?.sort((a, b) => {
    return Number(a.kommunenummer.kodeverdi) - Number(b.kommunenummer.kodeverdi);
  });

  return {
    kommuner: sortedKommuner,
    ...rest,
  };
};

const useKommuner = (fylkeId: string, shouldFetch = true) => {
  const { data: kommuner, ...rest } = useNibasApi(shouldFetch ? "/v1/kommuner" : null, {
    fylkeid: fylkeId,
  });

  const sortedKommuner = kommuner?.sort((a, b) => {
    return Number(a.kommunenummer.kodeverdi) - Number(b.kommunenummer.kodeverdi);
  });

  return {
    kommuner: sortedKommuner,
    ...rest,
  };
};

export default useKommuner;
