export const fetcher = <T extends any>(
  ...args: Parameters<typeof fetch>
): Promise<T> => fetch(...args).then((res) => res.json());
