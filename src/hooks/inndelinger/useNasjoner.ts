import useNibasApi, { getUrlWithParameters } from "../useNibasApi";
import { NasjonResponse } from "../../types/api";
import { useAuthentication } from "components/Authentication/AuthenticationHook";
import useSWRImmutable from "swr/immutable";
import { fetcherWithToken } from "utils/api";

const useNasjon = (gyldighetsdato: string | undefined, shouldFetch = true) => {
  const { data: nasjon, ...rest } = useNibasApi(shouldFetch ? "/v1/nasjon/" : null, { gyldighetsdato });

  const sortedNasjoner = nasjon?.navn?.sort((a, b) => {
    return Number(a.rekkefoelge ?? 0) - Number(b.rekkefoelge ?? 0);
  });
  return {
    nasjoner: sortedNasjoner,
    ...rest,
  };
};

const nasjonFetcher = async ([nasjonIds, gyldighetsdato, token]: [
  string[],
  string | undefined,
  string | undefined,
]) => {
  const promises: Promise<NasjonResponse>[] = nasjonIds.map(async () =>
    fetcherWithToken([getUrlWithParameters("/v1/nasjon/", { gyldighetsdato }), token]),
  );

  return await Promise.all(promises);
};

export const useNasjonByIds = (nasjonIds: string[], gyldighetsdato: string | undefined) => {
  const { token } = useAuthentication();

  return useSWRImmutable(nasjonIds.length > 0 ? [nasjonIds, gyldighetsdato, token] : null, nasjonFetcher);
};

export default useNasjon;
