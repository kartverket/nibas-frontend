import { StemmekretsResponse } from "../../types/api";
import { fetcherWithToken } from "utils/api";
import useSWRImmutable from "swr/immutable";
import useNibasApi, { getUrlWithParameters } from "hooks/useNibasApi";
import { useAuthentication } from "components/Authentication/AuthenticationHook";

const stemmekretserFetcher = async (params: [string, string[], string | undefined, string | undefined]) => {
  const [, stemmekretsIds, gyldighetsdato, token] = params;
  const promises: Promise<StemmekretsResponse>[] = stemmekretsIds.map(async (id) =>
    fetcherWithToken([getUrlWithParameters("/v1/stemmekretser/{id}", { id, gyldighetsdato }), token]),
  );

  return await Promise.all(promises);
};

export const useStemmekretser = (stemmekretsIds: string[], gyldighetsdato: string | undefined) => {
  const { token } = useAuthentication();

  return useSWRImmutable(
    // Vi legger på en string i key for å forhindre at swr bruker cache hvis man spør om samme IDer på tvers av hooks
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
