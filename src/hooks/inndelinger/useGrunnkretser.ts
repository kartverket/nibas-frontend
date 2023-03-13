import { GrunnkretsResponse } from "../../types/api";
import { fetcherWithToken } from "utils/swr";
import { useAuthenticationFlow } from "@kartverket/frontend-aut-lib";
import useSWRImmutable from "swr/immutable";

const grunnkretsFetcher = async (
  grunnkretsIds: string[],
  token: string | undefined
) => {
  const promises: Promise<GrunnkretsResponse>[] = grunnkretsIds.map(
    async (id) => fetcherWithToken(`/v1/grunnkretser/${id}`, token)
  );

  return await Promise.all(promises);
};

export const useGrunnkretser = (grunnkretsId: string[]) => {
  const { tokenHolderFunc } = useAuthenticationFlow();

  return useSWRImmutable(
    grunnkretsId.length > 0 ? [grunnkretsId, tokenHolderFunc()?.token] : null,
    grunnkretsFetcher
  );
};
