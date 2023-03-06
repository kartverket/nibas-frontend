import {
  ConflictResolved,
  OppdaterUtkastRequest,
  OpprettUtkastRequest,
  UtkastResponse,
} from "types/api";
import { fetcherWithToken } from "utils/swr";

export const createUtkast = async (
  utkast: OpprettUtkastRequest,
  token: string | undefined
) => {
  return await fetcherWithToken({
    method: "POST",
    url: "v1/utkast",
    body: JSON.stringify(utkast),
    token,
  });
};

export const updateUtkast = async (
  id: string,
  utkast: OppdaterUtkastRequest,
  token: string | undefined
): Promise<UtkastResponse> => {
  return await fetcherWithToken({
    method: "PUT",
    url: `v1/utkast/${id}`,
    body: JSON.stringify(utkast),
    token,
  });
};

export const publishUtkast = async (
  id: string,
  utkast: OppdaterUtkastRequest,
  token: string | undefined,
  errorCallback: (res: Response) => void
) => {
  return fetcherWithToken({
    method: "POST",
    url: `v1/utkast/${id}/publiser`,
    body: JSON.stringify(utkast),
    customErrorHandling: errorCallback,
    token,
  });
};

export const deleteUtkast = async (
  utkastId: string,
  token: string | undefined
) => {
  return fetcherWithToken({
    method: "DELETE",
    url: `v1/utkast/${utkastId}`,
    token,
  });
};

export const resolveUtkastConflict = async (
  utkastId: string,
  resolvedConflict: ConflictResolved,
  token: string | undefined
) => {
  return await fetcherWithToken({
    url: `v1/utkast/${utkastId}/resolved`,
    method: "POST",
    body: JSON.stringify(resolvedConflict),
    token,
  });
};
