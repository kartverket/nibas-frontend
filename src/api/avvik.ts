// TODO: Endre her når arbeidsliste er klart på skip
import { fetcherWithToken, getUrlForPath } from "utils/api";
import { getUrlWithParameters } from "hooks/useNibasApi";
export const avvikFetcher = async (token: string | undefined, kommuneLokalID: string) => {
  try {
    const url = `http://localhost:8082/api/v1/avvik/kommune/${kommuneLokalID}?grensetyper=Fylkesgrense&grensetyper=Kommunegrense`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching avvik:", error);
    throw error;
  }
};
export const avvikKommunerFetcher = async (token: string | undefined, page: number, size: number) => {
  try {
    const url = `http://localhost:8082/api/v1/avvik/kommuner?side=${page}&antall=${size}&grensetyper=Fylkesgrense&grensetyper=Kommunegrense`;
    // fetcherWithToken([getUrlWithParameters("/v1/avvik", { id: kretsId, gyldighetsdato }), token]);

    //   const stemmekretsFeatures = await Promise.all(promises);
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching avvik:", error);
    throw error;
  }
};

export const avvikUpdateStatus = (updates: { id: number; status: string }[], token?: string) => {
  const requestBody = {
    avvikUpdates: updates,
  };
  const url = "http://localhost:8082/api/v1/avvik";
  return fetch(url, {
    method: "POST",
    body: JSON.stringify(requestBody),
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
  });
};
