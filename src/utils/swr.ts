export const fetcher = <T extends unknown>(
  ...args: Parameters<typeof fetch>
): Promise<T> => fetch(...args).then((res) => res.json());

export const fetcherWithToken = (url: string, token: string) =>
  fetch(url, { headers: { Authorization: "Bearer " + token } }).then((res) => {
    if (!res.ok) {
      throw new Error("Fikk ikke hentet data.");
    }

    return res.json();
  });
