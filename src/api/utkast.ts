import { UtkastRequest, UtkastResponse } from "types/api";

export const createUtkast = async (
  utkast: UtkastRequest,
  token: string | undefined
) => {
  return fetch(`v1/utkast`, {
    method: "POST",
    body: JSON.stringify(utkast),
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
  });
};

export const updateUtkast = async (
  id: string,
  utkast: UtkastRequest,
  token: string | undefined
) => {
  return {
    id,
    ...utkast,
    status: "Test",
    auditInfoResponse: {
      endretAv: "Meg",
      oppdateringsdato: "2022-12-31",
    },
    opprettetDato: "2022-01-01",
  } as UtkastResponse;

  const response = await fetch(`v1/utkast/${id}`, {
    method: "PUT",
    body: JSON.stringify(utkast),
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
  });

  const json = await response.json();

  return json as UtkastResponse;
};
