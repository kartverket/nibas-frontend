import { GrunnkretsResponse } from "../../types/api";
import { fetcherWithToken } from "utils/api";
import useSWRImmutable from "swr/immutable";
import useNibasApi, { getUrlWithParameters } from "hooks/useNibasApi";
import { useAuthentication } from "components/Authentication/AuthenticationHook";

const grunnkretsFetcher = async (params: [string, string[], string | undefined, string | undefined]) => {
  const [, grunnkretsIds, gyldighetsdato, token] = params;
  const promises: Promise<GrunnkretsResponse>[] = grunnkretsIds.map(async (id) =>
    fetcherWithToken([getUrlWithParameters("/v1/grunnkretser/{id}", { id, gyldighetsdato }), token]),
  );

  return await Promise.all(promises);
};

export const useGrunnkretser = (grunnkretsId: string[], gyldighetsdato: string | undefined) => {
  const auth = useAuthentication();
  return useSWRImmutable(
    // Vi legger på en string i key for å forhindre at swr bruker cache hvis man spør om samme IDer på tvers av hooks
    grunnkretsId.length > 0 ? ["grunnkretser", grunnkretsId, gyldighetsdato, auth.token] : null,
    grunnkretsFetcher,
  );
};

export const useKommuneGrunnkretser = (kommuneId: string | null, gyldighetsdato: string | undefined) => {
  return useNibasApi(kommuneId != null ? "/v1/kommuner/{id}/grunnkretser" : null, {
    id: kommuneId!,
    gyldighetsdato,
  });
};
