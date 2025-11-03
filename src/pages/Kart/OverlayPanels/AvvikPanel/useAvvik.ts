import { getArbeidslisteUrlForPath, getArbeidslisteUrlWithParameters } from "hooks/useArbeidslisteApi";
import useSWR from "swr";
import { fetcherWithToken } from "utils/api";

const avvikKommunerFetcher = async (page: number, size: number) => {
  const urlPath = "/api/v1/avvik/kommuner";

  const url = getArbeidslisteUrlWithParameters(urlPath, { side: page, antall: size });
  const response = await fetcherWithToken([url]);
  return response;
};

export const useKommunerMedAvvik = (shouldFetch: boolean, page: number) => {
  const { data, isLoading, error } = useSWR(
    shouldFetch ? [page] : null,
    () => avvikKommunerFetcher(page, 15),
    {
      keepPreviousData: true,
    },
  );
  return { data, isLoading, error };
};

const avvikFetcher = async (kommuneLokalID: string) => {
  const urlPath = "/api/v1/avvik/kommune/{lokalId}";
  const url = getArbeidslisteUrlWithParameters(urlPath, {
    lokalId: kommuneLokalID,
    grensetyper: ["Fylkesgrense", "Kommunegrense"],
  });

  const response = await fetcherWithToken([url]);
  return response;
};

export const useAvvikForKommune = (kommuneId: string) => {
  const { data, isLoading, error, mutate } = useSWR(kommuneId ? [kommuneId] : null, () => avvikFetcher(kommuneId));
  return { data, isLoading, error, mutate };
};

export const avvikUpdateStatus = (updates: { id: number; status: string }[]) => {
  const url = getArbeidslisteUrlForPath("/api/v1/avvik");
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
