import { GrunnkretsResponse } from "../../types/api";
import { fetcherWithToken } from "utils/api";
import { useAuthenticationFlow } from "@kartverket/frontend-aut-lib";
import useSWRImmutable from "swr/immutable";
import useNibasApi from "hooks/useNibasApi";

const grunnkretsFetcher = async ([grunnkretsIds, token]: [string[], string | undefined]) => {
  const promises: Promise<GrunnkretsResponse>[] = grunnkretsIds.map(async (id) =>
    fetcherWithToken([`/v1/grunnkretser/${id}`, token]),
  );

  return await Promise.all(promises);
};

export const useGrunnkretser = (grunnkretsId: string[]) => {
  const { tokenHolderFunc } = useAuthenticationFlow();

  return useSWRImmutable(grunnkretsId.length > 0 ? [grunnkretsId, tokenHolderFunc()?.token] : null, grunnkretsFetcher);
};

export const useKommuneGrunnkretser = (kommuneId: string | undefined) => {
  return useNibasApi(kommuneId !== undefined ? "/v1/kommuner/{id}/grunnkretser" : null, {
    id: kommuneId!,
  });
};

export const useToKommunerGrunnkretser = (kommuneAId: string | undefined, kommuneBId: string | undefined) => {
  const { data: grunnkretserA, isLoading: k1Loading } = useKommuneGrunnkretser(kommuneAId);
  const { data: grunnkretserB, isLoading: k2Loading } = useKommuneGrunnkretser(kommuneBId);
  return {
    kommuneA: grunnkretserA,
    kommuneB: grunnkretserB,
    grunnkretserIsLoading: k1Loading || k2Loading,
  };
};
