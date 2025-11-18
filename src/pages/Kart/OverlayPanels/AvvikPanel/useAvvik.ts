import { getArbeidslisteUrlForPath, getArbeidslisteUrlWithParameters } from "hooks/useArbeidslisteApi";
import useSWR from "swr";
import { fetchUrl } from "utils/api";
import { AvvikForKommuneResponse } from "./avvik-utils";

const avvikKommuneParFetcher = async (page: number, size: number, grensetyper?: string[]) => {
  const urlPath = "/internal-api/api/v1/avvik/kommunepar";

  const url = getArbeidslisteUrlWithParameters(urlPath, {
    side: page,
    antall: size,
    ...(grensetyper && { grensetyper }),
  });
  const response = await fetchUrl([url]);
  return response;
};

export const useKommuneParMedAvvik = (shouldFetch: boolean, page: number, grensetyper?: string[]) => {
  const { data, isLoading, error } = useSWR(
    shouldFetch ? [page, grensetyper] : null,
    () => avvikKommuneParFetcher(page, 15, grensetyper),
    {
      keepPreviousData: true,
    },
  );
  return { data, isLoading, error };
};

const avvikKommunerFetcher = async (page: number, size: number, grensetyper?: string[]) => {
  const urlPath = "/internal-api/api/v1/avvik/kommuner";

  const url = getArbeidslisteUrlWithParameters(urlPath, {
    side: page,
    antall: size,
    ...(grensetyper && { grensetyper }),
  });
  const response = await fetchUrl([url]);
  return response;
};

export const useKommunerMedAvvik = (shouldFetch: boolean, page: number, grensetyper?: string[]) => {
  const { data, isLoading, error } = useSWR(
    shouldFetch ? ["kommuner", page, grensetyper] : null,
    () => avvikKommunerFetcher(page, 15, grensetyper),
    {
      keepPreviousData: true,
    },
  );
  return { data, isLoading, error };
};

const avvikFetcher = async (
  kommuneLokalID1: string,
  kommuneLokalID2: string,
  grensetyper?: string[],
): Promise<AvvikForKommuneResponse> => {
  const urlPath = "/internal-api/api/v1/avvik/kommunepar/{lokalId1}/{lokalId2}";
  const url = getArbeidslisteUrlWithParameters(urlPath, {
    lokalId1: kommuneLokalID1,
    lokalId2: kommuneLokalID2,
    ...(grensetyper && { grensetyper }),
  });

  const response = await fetchUrl([url]);
  return response;
};

const avvikForKommuneFetcher = async (
  kommuneLokalID: string,
  grensetyper?: string[],
): Promise<AvvikForKommuneResponse> => {
  const urlPath = "/internal-api/api/v1/avvik/kommune/{lokalId}";
  const url = getArbeidslisteUrlWithParameters(urlPath, {
    lokalId: kommuneLokalID,
    ...(grensetyper && { grensetyper }),
  });

  const response = await fetchUrl([url]);
  return response;
};

export const useAvvikForKommunePar = (kommuneLokalIDs: string[], grensetyper?: string[]) => {
  const { data, isLoading, error, mutate } = useSWR(
    kommuneLokalIDs != null && kommuneLokalIDs.length === 2 ? [kommuneLokalIDs, grensetyper] : null,
    () => avvikFetcher(kommuneLokalIDs[0], kommuneLokalIDs[1], grensetyper),
  );
  return { data, isLoading, error, mutate };
};

export const useAvvikForKommune = (kommuneLokalIDs: string[], grensetyper?: string[]) => {
  const { data, isLoading, error, mutate } = useSWR(
    kommuneLokalIDs != null && kommuneLokalIDs.length === 1 ? ["single", kommuneLokalIDs, grensetyper] : null,
    () => avvikForKommuneFetcher(kommuneLokalIDs[0], grensetyper),
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
