import { GrunnkretsResponse } from "../../types/api";
import { fetcherWithToken, getIdFromEntity } from "utils/api";
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

export const useKommuneGrunnkretser = (kommuneId: string) => {
  const { tokenHolderFunc } = useAuthenticationFlow();
  const { data: grunnkretser } = useNibasApi(kommuneId ? "/v1/kommuner/{id}/grunnkretser" : null, {
    id: kommuneId,
  });

  const grunnkretsIds = grunnkretser?.map(getIdFromEntity) || [];
  return useSWRImmutable(
    grunnkretsIds.length > 0 ? [grunnkretsIds, tokenHolderFunc()?.token] : null,
    grunnkretsFetcher,
  );
};

export const useToKommunerGrunnkretser = (kommunerId: (string | undefined)[]) => {
  const { data: grunnkretserA, isLoading: k1Loading } = useNibasApi(
    kommunerId[0] ? "/v1/kommuner/{id}/grunnkretser" : null,
    {
      id: kommunerId[0] as string,
    },
  );

  const { data: grunnkretserB, isLoading: k2Loading } = useNibasApi(
    kommunerId[1] ? "/v1/kommuner/{id}/grunnkretser" : null,
    {
      id: kommunerId[1] as string,
    },
  );
  return {
    kommuneA: grunnkretserA,
    kommuneB: grunnkretserB,
    grunnkretserIsLoading: k1Loading || k2Loading,
  };
};
