export const fetcher = <T>(...args: Parameters<typeof fetch>): Promise<T> =>
  fetch(...args).then((res) => res.json());

export const fetcherWithToken = async (url: string | null, token?: string) => {
  if (!url) return;

  const res = await fetch(url, {
    headers: { Authorization: "Bearer " + token ?? "" },
  });

  if (!res.ok) {
    throw new Error("Fikk ikke hentet data.");
  }

  return res.json();
};
