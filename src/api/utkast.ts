import {
  ConflictResolved,
  OppdaterUtkastRequest,
  OpprettUtkastRequest,
} from "types/api";
import { getUrlForPath } from "utils/api";

export const createUtkast = (
  utkast: OpprettUtkastRequest,
  token: string | undefined
) => {
  return fetch(getUrlForPath(`v1/utkast`), {
    method: "POST",
    body: JSON.stringify(utkast),
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
  });
};

export const updateUtkast = (
  id: string,
  utkast: OppdaterUtkastRequest,
  token: string | undefined
) => {
  return fetch(getUrlForPath(`v1/utkast/${id}`), {
    method: "PUT",
    body: JSON.stringify(utkast),
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
  });
};

export const publishUtkast = (
  id: string,
  utkast: OppdaterUtkastRequest,
  token: string | undefined
) => {
  return fetch(getUrlForPath(`v1/utkast/${id}/publiser`), {
    method: "POST",
    body: JSON.stringify(utkast),
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

export const resolveUtkastConflict = (
  utkastId: string,
  resolvedConflict: ConflictResolved,
  token: string | undefined
) => {
  return fetch(getUrlForPath(`v1/utkast/${utkastId}/resolved`), {
    method: "POST",
    body: JSON.stringify(resolvedConflict),
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
  });
};
