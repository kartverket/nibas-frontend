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
