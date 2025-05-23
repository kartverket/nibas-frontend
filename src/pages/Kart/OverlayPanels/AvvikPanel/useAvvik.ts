import { getArbeidslisteUrlForPath, getArbeidslisteUrlWithParameters } from "hooks/useArbeidslisteApi";
import { fetcherWithToken } from "utils/api";

export const avvikFetcher = async (token: string | undefined, kommuneLokalID: string) => {
  const urlPath = "/api/v1/avvik/kommune/{lokalId}";
  const url = getArbeidslisteUrlWithParameters(urlPath, {
    lokalId: kommuneLokalID,
    grensetyper: ["Fylkesgrense", "Kommunegrense"],
  });

  const response = await fetcherWithToken([url, token]);
  return response;
};

export const avvikKommunerFetcher = async (token: string | undefined, page: number, size: number) => {
  const urlPath = "/api/v1/avvik/kommuner";

  const url = getArbeidslisteUrlWithParameters(urlPath, { side: page, antall: size });
  const response = await fetcherWithToken([url, token]);
  return response;
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

export const hentGrenselinjer = async (token: string | undefined, kommunenummer: string) => {
  const urlPath = "/api/v1/matrikkel/grenselinjer";
  const url = getArbeidslisteUrlWithParameters(urlPath, { kommunenummer });
  return fetcherWithToken([url, token]);
};

export const hentTilgjengeligeKommuner = async (token: string | undefined) => {
  const urlPath = "/api/v1/matrikkel/grenselinjer/kommuner";
  const url = getArbeidslisteUrlForPath(urlPath);
  return fetcherWithToken([url, token]);
};
