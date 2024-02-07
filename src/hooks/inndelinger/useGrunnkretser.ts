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

export const useKommuneGrunnkretserRef = (kommuneId: string | undefined) => {
  return useNibasApi(kommuneId ? "/v1/kommuner/{id}/grunnkretser" : null, {
    id: kommuneId!,
  });
};

export const useKommuneGrunnkretser = (kommuneId: string) => {
  const { tokenHolderFunc } = useAuthenticationFlow();
  const { data: grunnkretser } = useKommuneGrunnkretserRef(kommuneId);

  const grunnkretsIds = grunnkretser?.map(getIdFromEntity) || [];
  return useSWRImmutable(
    grunnkretsIds.length > 0 ? [grunnkretsIds, tokenHolderFunc()?.token] : null,
    grunnkretsFetcher,
  );
};

export const useToKommunerGrunnkretser = (kommunerId: (string | undefined)[]) => {
  const { data: grunnkretserA, isLoading: k1Loading } = useKommuneGrunnkretserRef(kommunerId[0]);
  const { data: grunnkretserB, isLoading: k2Loading } = useKommuneGrunnkretserRef(kommunerId[1]);
  return {
    kommuneA: grunnkretserA,
    kommuneB: grunnkretserB,
    grunnkretserIsLoading: k1Loading || k2Loading,
  };
};
