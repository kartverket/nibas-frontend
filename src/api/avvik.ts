// TODO: Endre her når arbeidsliste er klart på skip
export const avvikFetcher = async (token: string | undefined, kommuneLokalID: string) => {
  const url = `http://localhost:8082/api/v1/avvik/kommune/${kommuneLokalID}?grensetyper=Fylkesgrense&grensetyper=Kommunegrense`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await response.json();
  return data;
};
export const avvikKommunerFetcher = async (token: string | undefined, page: number, size: number) => {
  const url = `http://localhost:8082/api/v1/avvik/kommuner?side=${page}&antall=${size}&grensetyper=Fylkesgrense&grensetyper=Kommunegrense`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await response.json();
  return data;
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
