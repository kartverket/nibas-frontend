import {
  OppdaterUtkastRequest,
  OpprettUtkastRequest,
  UtkastResponse,
} from "types/api";

export const createUtkast = async (
  utkast: OpprettUtkastRequest,
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
  utkast: OppdaterUtkastRequest,
  token: string | undefined
) => {
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

export const publishUtkast = async (
  id: string,
  utkast: OppdaterUtkastRequest,
  token: string | undefined
) => {
  return fetch(`v1/utkast/${id}/publiser`, {
    method: "POST",
    body: JSON.stringify(utkast),
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
  });
};
