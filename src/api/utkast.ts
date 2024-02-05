import { OppdaterUtkastRequest, OpprettUtkastRequest } from "types/api";
import { getUrlForPath } from "utils/api";

export const createUtkast = (utkast: OpprettUtkastRequest, token: string | undefined) => {
  return fetch(getUrlForPath(`v1/utkast`), {
    method: "POST",
    body: JSON.stringify(utkast),
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
  });
};

export const updateUtkastApi = (id: string, utkast: OppdaterUtkastRequest, token?: string) => {
  return fetch(getUrlForPath(`v1/utkast/${id}`), {
    method: "PUT",
    body: JSON.stringify(utkast),
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
  });
};

export const publishUtkast = (id: string, publiseringsdato: string, token: string | undefined) => {
  return fetch(getUrlForPath(`v1/utkast/${id}/publiser`), {
    method: "POST",
    body: JSON.stringify({ publiseringsdato }),
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
  });
};

export const deleteUtkast = (utkastId: string, token: string | undefined) => {
  return fetch(getUrlForPath(`v1/utkast/${utkastId}`), {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
  });
};
