import { ApiErrorResponse } from "../types/api";

type ApiEntity = {
  id: {
    lokalid: {
      value: string;
    };
  };
};

type ApiEntityWithIdentifikasjon = {
  identifikasjon: {
    lokalid: string;
  };
};

export const getIdFromEntity = (entity: ApiEntity | ApiEntityWithIdentifikasjon) => {
  if ("identifikasjon" in entity) {
    return entity.identifikasjon.lokalid;
  } else if ("id" in entity) {
    return entity.id.lokalid.value;
  }

  return "";
};

class ResponseError extends Error {
  response: Response;
  constructor(message: string, response: Response) {
    super(message);
    this.response = response;
  }
}

/**
 * Gjør om en path til en fullstendig URI som kan brukes av fetch. Årsaken til dette
 * er at om man kjører fetch på serveren (f.eks. i tester) så bruker man node-fetch
 * som krever fullstendig URIer for å fungere. Default bruker den domener nettsiden er på
 * som base-path, men fallbacker til localhost om `document.location` ikke er satt.
 *
 * @param path en path du ønsker å konvertere til full URI.
 * @returns En string som er en gyldig URI for gitt path.
 */
export const getUrlForPath = (path: string): string => {
  const baseUrl = document.location.origin ?? "http://localhost:3000";

  if (path.startsWith("http")) {
    return path;
  }

  if (path.startsWith("/")) {
    return baseUrl + path;
  }
  return `${baseUrl}/${path}`;
};

export const fetcherWithToken = async ([url, token]: [string | null, string | undefined]) => {
  if (url === null) return;

  const res = await fetch(getUrlForPath(url), {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    throw new ResponseError("Fikk ikke hentet data.", res);
  }

  return res.json();
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isApiError = (err: any): err is ApiErrorResponse => {
  return err.errorCode !== null && err.errorDescription !== null;
};

export const statusCode = {
  isInformational: (code: number) => code >= 100 && code < 200,
  isSuccessful: (code: number) => code >= 200 && code < 300,
  isConflict: (code: number) => code === 409,
  isRedirection: (code: number) => code >= 300 && code < 400,
  isClientError: (code: number) => code >= 400 && code < 500,
  isServerError: (code: number) => code >= 500 && code < 600,
  isError: (code: number) => code >= 400 && code < 600,
};
