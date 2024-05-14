import { GrunnkretsResponse } from "../../types/api";
import { fetcherWithToken } from "utils/api";
import useSWRImmutable from "swr/immutable";
import useNibasApi from "hooks/useNibasApi";
import { useAuthentication } from "components/Authentication/AuthenticationHook";

const grunnkretsFetcher = async ([grunnkretsIds, token]: [string[], string | undefined]) => {
  const promises: Promise<GrunnkretsResponse>[] = grunnkretsIds.map(async (id) =>
    fetcherWithToken([`/v1/grunnkretser/${id}`, token]),
  );

  return await Promise.all(promises);
};

export const useGrunnkretser = (grunnkretsId: string[]) => {
  const auth = useAuthentication();
  return useSWRImmutable(grunnkretsId.length > 0 ? [grunnkretsId, auth.token] : null, grunnkretsFetcher);
};

export const useKommuneGrunnkretser = (kommuneId: string | null) => {
  return useNibasApi(kommuneId != null ? "/v1/kommuner/{id}/grunnkretser" : null, {
    id: kommuneId!,
  });
};
