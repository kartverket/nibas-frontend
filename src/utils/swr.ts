interface ResponseError extends Error {
  status?: number;
}

// TODO:feilhåndtering for de som IKKE bruker denne
// TODO: bruk fetcherWithToken alle steder vi kan, gjelder ikke geonorge og sånt

// TODO: ta inn type, default get, frivillig
// TODO: ta inn body, frivillig
export const fetcherWithToken = async (url: string | null, token?: string) => {
  if (!url) return;

  // TODO: legg inn content type
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
