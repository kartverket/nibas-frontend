import { StemmekretsResponse } from "../../types/api";
import { fetcherWithToken } from "utils/api";
import useSWRImmutable from "swr/immutable";
import useNibasApi, { getUrlWithParameters } from "hooks/useNibasApi";
import { useAuthentication } from "components/Authentication/AuthenticationHook";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const stemmekretserFetcher = async ([keydiff, stemmekretsIds, gyldighetsdato, token]: [
  string,
  string[],
  string | undefined,
  string | undefined,
]) => {
  const promises: Promise<StemmekretsResponse>[] = stemmekretsIds.map(async (id) =>
    fetcherWithToken([getUrlWithParameters("/v1/stemmekretser/{id}", { id, gyldighetsdato }), token]),
  );

  return await Promise.all(promises);
};

export const useStemmekretser = (stemmekretsIds: string[], gyldighetsdato: string | undefined) => {
  const { token } = useAuthentication();

  return useSWRImmutable(
    stemmekretsIds.length > 0 ? ["stemmekretser", stemmekretsIds, gyldighetsdato, token] : null,
    stemmekretserFetcher,
  );
};

export const useKommuneStemmekretser = (kommuneId: string | null, gyldighetsdato: string | undefined) => {
  return useNibasApi(kommuneId != null ? "/v1/kommuner/{id}/stemmekretser" : null, {
    id: kommuneId!,
    gyldighetsdato,
  });
};
