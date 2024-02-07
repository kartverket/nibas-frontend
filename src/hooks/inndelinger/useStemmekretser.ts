import { StemmekretsResponse } from "../../types/api";
import { fetcherWithToken, getIdFromEntity } from "utils/api";
import { useAuthenticationFlow } from "@kartverket/frontend-aut-lib";
import useSWRImmutable from "swr/immutable";
import useNibasApi from "hooks/useNibasApi";

const stemmekretserFetcher = async ([stemmekretsIds, token]: [string[], string | undefined]) => {
  const promises: Promise<StemmekretsResponse>[] = stemmekretsIds.map(async (id) =>
    fetcherWithToken([`/v1/stemmekretser/${id}`, token]),
  );

  return await Promise.all(promises);
};

export const useStemmekretser = (stemmekretsIds: string[]) => {
  const { tokenHolderFunc } = useAuthenticationFlow();

  return useSWRImmutable(
    stemmekretsIds.length > 0 ? [stemmekretsIds, tokenHolderFunc()?.token] : null,
    stemmekretserFetcher,
  );
};

export const useKommuneStemmekretserRef = (kommuneId: string | undefined) => {
  return useNibasApi(kommuneId ? "/v1/kommuner/{id}/stemmekretser" : null, {
    id: kommuneId!,
  });
};

export const useKommuneStemmekretser = (kommuneId: string) => {
  const { tokenHolderFunc } = useAuthenticationFlow();
  const { data: stemmekretser } = useKommuneStemmekretserRef(kommuneId);

  const stemmekretsIds = stemmekretser?.map(getIdFromEntity) || [];
  return useSWRImmutable(
    stemmekretsIds.length > 0 ? [stemmekretsIds, tokenHolderFunc()?.token] : null,
    stemmekretserFetcher,
  );
};

export const useToKommunerStemmekretser = (kommunerId: (string | undefined)[]) => {
  const { data: stemmekretserA, isLoading: k1Loading } = useKommuneStemmekretserRef(kommunerId[0]);
  const { data: stemmekretserB, isLoading: k2Loading } = useKommuneStemmekretserRef(kommunerId[1]);
  return {
    kommuneA: stemmekretserA,
    kommuneB: stemmekretserB,
    stemmekretserIsLoading: k1Loading || k2Loading,
  };
};
