import { useAuthenticationFlow } from "@kartverket/frontend-aut-lib";
import useNibasApi from "hooks/useNibasApi";
import useSWRImmutable from "swr/immutable";
import { UtkastResponse } from "types/api";
import { fetcherWithToken } from "utils/api";

const utkastFetcher = async ([utkastIds, token]: [
  string[],
  string | undefined
]) => {
  const promises: Promise<UtkastResponse>[] = utkastIds.map(async (id) =>
    fetcherWithToken([`/v1/utkast/${id}`, token])
  );

  return await Promise.all(promises);
};

export const useUtkasts = () => {
  const { tokenHolderFunc } = useAuthenticationFlow();
  const { data: utkasts } = useNibasApi("/v1/utkast");
  const utkastIds = utkasts?.map((u) => u.id) ?? [];

  return useSWRImmutable(
    utkastIds.length > 0 ? [utkastIds, tokenHolderFunc()?.token] : null,
    utkastFetcher
  );
};
