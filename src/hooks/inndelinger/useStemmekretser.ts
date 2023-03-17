import { StemmekretsResponse } from "../../types/api";
import { fetcherWithToken } from "utils/api";
import { useAuthenticationFlow } from "@kartverket/frontend-aut-lib";
import useSWRImmutable from "swr/immutable";

const stemmekretserFetcher = async (
  stemmekretsIds: string[],
  token: string | undefined
) => {
  const promises: Promise<StemmekretsResponse>[] = stemmekretsIds.map(
    async (id) => fetcherWithToken(`/v1/stemmekretser/${id}`, token)
  );

  return await Promise.all(promises);
};

export const useStemmekretser = (stemmekretsIds: string[]) => {
  const { tokenHolderFunc } = useAuthenticationFlow();

  return useSWRImmutable(
    stemmekretsIds.length > 0
      ? [stemmekretsIds, tokenHolderFunc()?.token]
      : null,
    stemmekretserFetcher
  );
};
