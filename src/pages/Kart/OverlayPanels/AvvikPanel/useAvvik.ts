import { getArbeidslisteUrlForPath, getArbeidslisteUrlWithParameters } from "hooks/useArbeidslisteApi";
import useSWR from "swr";
import { fetchUrl } from "utils/api";
import { AvvikForKommuneResponse } from "./avvik-utils";

const avvikKommuneParFetcher = async (page: number, size: number) => {
  const urlPath = "/internal-api/api/v1/avvik/kommunepar";

  const url = getArbeidslisteUrlWithParameters(urlPath, {
    side: page,
    antall: size,
  });
  const response = await fetchUrl([url]);
  return response;
};

export const useKommuneParMedAvvik = (shouldFetch: boolean, page: number) => {
  const { data, isLoading, error } = useSWR(shouldFetch ? [page] : null, () => avvikKommuneParFetcher(page, 15), {
    keepPreviousData: true,
  });
  return { data, isLoading, error };
};

const avvikFetcher = async (kommuneLokalID1: string, kommuneLokalID2: string): Promise<AvvikForKommuneResponse> => {
  const urlPath = "/internal-api/api/v1/avvik/kommunepar/{lokalId1}/{lokalId2}";
  const url = getArbeidslisteUrlWithParameters(urlPath, {
    lokalId1: kommuneLokalID1,
    lokalId2: kommuneLokalID2,
    grensetyper: ["Fylkesgrense", "Kommunegrense"],
  });

  const response = await fetchUrl([url]);
  return response;
};

export const useAvvikForKommunePar = (kommuneLokalIDs: string[]) => {
  const { data, isLoading, error, mutate } = useSWR(
    kommuneLokalIDs != null && kommuneLokalIDs.length === 2 ? [kommuneLokalIDs] : null,
    () => avvikFetcher(kommuneLokalIDs[0], kommuneLokalIDs[1]),
  );
  return { data, isLoading, error, mutate };
};

export const avvikUpdateStatus = (updates: { id: number; status: string }[]) => {
  const url = getArbeidslisteUrlForPath("/internal-api/api/v1/avvik");
  const requestBody = {
    avvikUpdates: updates,
  };
  return fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  });
};
 