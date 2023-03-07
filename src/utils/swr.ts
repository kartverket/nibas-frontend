interface ResponseError extends Error {
  status?: number;
}

// TODO:feilhåndtering for de som IKKE bruker denne
// TODO: bruk fetcherWithToken alle steder vi kan, gjelder ikke geonorge og sånt

type FetcherProps = {
  url: string;
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: string;
  token?: string;
  customErrorHandling?: (res: Response) => void;
};

const defaultErrorHandling = (res: Response) => {
  const error: ResponseError = new Error("Fikk ikke hentet data.");
  error.status = res.status;
  throw error;
};

// TODO: Mistenker at det blir trøbbel når fetcherWithToken sendes inn til useSwr som en fetcher, vil props mappes riktig?
export const fetcherWithToken = async ({
  method = "GET",
  url,
  body,
  token,
  customErrorHandling,
}: FetcherProps) => {
  const res = await fetch(url, {
    method,
    body,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  // TODO: Bruk global kontekst?
  if (!res.ok) {
    if (customErrorHandling) {
      customErrorHandling(res);
    } else {
      defaultErrorHandling(res);
    }
  }

  return res.json();
};
