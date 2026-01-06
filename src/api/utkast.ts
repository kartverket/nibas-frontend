import { OppdaterUtkastRequest, OpprettUtkastRequest } from "types/api";
import { getUrlForPath } from "utils/api";

export const createUtkast = (utkast: OpprettUtkastRequest) => {
  return fetch(getUrlForPath(`v1/utkast`), {
    method: "POST",
    body: JSON.stringify(utkast),
    headers: {
      "Content-Type": "application/json",
    },
  });
};

export const updateUtkastApi = (id: string, utkast: OppdaterUtkastRequest) => {
  return fetch(getUrlForPath(`v1/utkast/${id}`), {
    method: "PUT",
    body: JSON.stringify(utkast),
    headers: {
      "Content-Type": "application/json",
    },
  });
};

export const publishUtkast = (id: string) => {
  return fetch(getUrlForPath(`v1/utkast/${id}/publiser`), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });
};

export const deleteUtkast = (utkastId: string) => {
  return fetch(getUrlForPath(`v1/utkast/${utkastId}`), {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });
};
