import useNibasApi from "../useNibasApi";

const useKommuner = (fylkeId: string | null = null, shouldFetch = true) => {
  const { data: kommuner, ...rest } = useNibasApi(
    shouldFetch ? "/v1/kommuner" : null,
    fylkeId != null
      ? {
          fylkeid: fylkeId,
        }
      : undefined,
  );

  const sortedKommuner = kommuner?.sort((a, b) => {
    return Number(a.nummer) - Number(b.nummer);
  });

  return {
    kommuner: sortedKommuner,
    ...rest,
  };
};

export const useKommune = (kommuneId: string, shouldFetch = true) => {
  const { data: kommune, ...rest } = useNibasApi(shouldFetch ? "/v1/kommuner/{id}" : null, {
    id: kommuneId,
  });

  return {
    kommune,
    ...rest,
  };
};

export default useKommuner;
