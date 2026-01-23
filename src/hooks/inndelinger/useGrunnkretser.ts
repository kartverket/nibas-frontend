import { GrunnkretsResponse } from "../../types/api";
import { fetchUrl } from "utils/api";
import useSWRImmutable from "swr/immutable";
import useNibasApi, { getUrlWithParameters } from "hooks/useNibasApi";

const grunnkretsFetcher = async ([grunnkretsIds, gyldighetsdato]: [string[], string | undefined]) => {
  const promises: Promise<GrunnkretsResponse>[] = grunnkretsIds.map(async (id) =>
    fetchUrl([getUrlWithParameters("/v1/grunnkretser/{id}", { id, gyldighetsdato })]),
  );

  return await Promise.all(promises);
};

export const useGrunnkretser = (
  grunnkretsId: string[],
  gyldighetsdato: string | undefined,
  shouldFetch: boolean = true,
) => {
  return useSWRImmutable(
    grunnkretsId.length > 0 && shouldFetch ? [grunnkretsId, gyldighetsdato] : null,
    grunnkretsFetcher,
  );
};

export const useKommuneGrunnkretser = (
  kommuneId: string | null,
  gyldighetsdato: string | undefined,
  shouldFetch: boolean = true,
) => {
  return useNibasApi(shouldFetch && kommuneId != null ? "/v1/kommuner/{id}/grunnkretser" : null, {
    id: kommuneId!,
    gyldighetsdato,
  });
};
