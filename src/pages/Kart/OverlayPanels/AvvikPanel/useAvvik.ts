import { getArbeidslisteUrlForPath, getArbeidslisteUrlWithParameters } from "hooks/useArbeidslisteApi";
import useSWR from "swr";
import { fetcherWithToken } from "utils/api";

const avvikKommunerFetcher = async (token: string | undefined, page: number, size: number) => {
  const urlPath = "/api/v1/avvik/kommuner";

  const url = getArbeidslisteUrlWithParameters(urlPath, { side: page, antall: size });
  const response = await fetcherWithToken([url, token]);
  return response;
};

export const useKommunerMedAvvik = (shouldFetch: boolean, page: number, token: string | undefined) => {
  const { data, isLoading, error } = useSWR(
    shouldFetch ? [page, token] : null,
    () => avvikKommunerFetcher(token, page, 15),
    {
      keepPreviousData: true,
    },
  );
  return { data, isLoading, error };
};

const avvikFetcher = async (token: string | undefined, kommuneLokalID: string) => {
  const urlPath = "/api/v1/avvik/kommune/{lokalId}";
  const url = getArbeidslisteUrlWithParameters(urlPath, {
    lokalId: kommuneLokalID,
    grensetyper: ["Fylkesgrense", "Kommunegrense"],
  });

  const response = await fetcherWithToken([url, token]);
  return response;
};

export const useAvvikForKommune = (kommuneId: string, token: string | undefined) => {
  const { data, isLoading, error, mutate } = useSWR(kommuneId ? [kommuneId, token] : null, () =>
    avvikFetcher(token, kommuneId),
  );
  return { data, isLoading, error, mutate };
};

export const avvikUpdateStatus = (updates: { id: number; status: string }[], token?: string) => {
  const url = getArbeidslisteUrlForPath("/api/v1/avvik");
  const requestBody = {
    avvikUpdates: updates,
  };
  return fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(requestBody),
  });
};
