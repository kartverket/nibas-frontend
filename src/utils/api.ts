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

export const getIdFromEntity = (
  entity: ApiEntity | ApiEntityWithIdentifikasjon
) => {
  if ((entity as ApiEntityWithIdentifikasjon).identifikasjon) {
    return (entity as ApiEntityWithIdentifikasjon).identifikasjon.lokalid;
  } else if ((entity as ApiEntity).id) {
    return (entity as ApiEntity).id.lokalid.value;
  }

  return "";
};

interface ResponseError extends Error {
  status?: number;
}

export const fetcherWithToken = async (url: string | null, token?: string) => {
  if (!url) return;

  const res = await fetch(url, {
    headers: { Authorization: "Bearer " + token ?? "" },
  });

  if (!res.ok) {
    const error: ResponseError = new Error("Fikk ikke hentet data.");
    error.status = res.status;
    throw error;
  }

  return res.json();
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
