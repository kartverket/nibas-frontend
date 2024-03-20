import { StemmekretsResponse } from "../../types/api";
import { fetcherWithToken } from "utils/api";
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

export const useKommuneStemmekretser = (kommuneId: string | null) => {
  const t = useNibasApi(kommuneId != null ? "/v1/kommuner/{id}/stemmekretser" : null, {
    id: kommuneId!,
  });
  console.log(t);
  return t;
};

export const useToKommunerStemmekretser = (kommuneAId: string | null, kommuneBId: string | null) => {
  const { data: stemmekretserA, isLoading: k1Loading } = useKommuneStemmekretser(kommuneAId);
  const { data: stemmekretserB, isLoading: k2Loading } = useKommuneStemmekretser(kommuneBId);
  return {
    kommuneA: stemmekretserA,
    kommuneB: stemmekretserB,
    stemmekretserIsLoading: k1Loading || k2Loading,
  };
};
