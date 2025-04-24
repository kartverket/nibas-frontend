import useNibasApi, { getUrlWithParameters } from "../useNibasApi";
import { KommuneResponse } from "../../types/api";
import { useAuthentication } from "components/Authentication/AuthenticationHook";
import useSWRImmutable from "swr/immutable";
import { fetcherWithToken } from "utils/api";

const useKommuner = (fylkeId: string | null = null, gyldighetsdato: string | undefined, shouldFetch = true) => {
  const { data: kommuner, ...rest } = useNibasApi(
    shouldFetch ? "/v1/kommuner" : null,
    fylkeId != null
      ? {
          fylkeid: fylkeId,
          gyldighetsdato,
        }
      : undefined,
  );

  const sortedKommuner = kommuner?.sort((a, b) => {
    return Number(a.nummer) - Number(b.nummer);
  });

  return {
    kommuner: sortedKommuner,
    ...rest,
  };
};

const kommunerFetcher = async ([kommuneIds, gyldighetsdato, token]: [
  string[],
  string | undefined,
  string | undefined,
]) => {
  const promises: Promise<KommuneResponse>[] = kommuneIds.map(async (id) =>
    fetcherWithToken([getUrlWithParameters("/v1/kommuner/{id}", { id, gyldighetsdato }), token]),
  );

  return await Promise.all(promises);
};

export const useKommunerByIds = (kommuneIds: string[], gyldighetsdato: string | undefined) => {
  const { token } = useAuthentication();

  return useSWRImmutable(kommuneIds.length > 0 ? [kommuneIds, gyldighetsdato, token] : null, kommunerFetcher);
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
