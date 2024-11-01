import useNibasApi from "../useNibasApi";

const useKommuner = (fylkeId: string | null = null, gyldighetsdato: string | undefined, shouldFetch = true) => {
  const { data: kommuner, ...rest } = useNibasApi(
    shouldFetch ? "/v1/kommuner" : null,
    fylkeId != null
      ? {
          fylkeid: fylkeId,
          gyldighetsdato,
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

export const useKommune = (kommuneId: string, gyldighetsdato: string | undefined, shouldFetch = true) => {
  const { data: kommune, ...rest } = useNibasApi(shouldFetch ? "/v1/kommuner/{id}" : null, {
    id: kommuneId,
    gyldighetsdato,
  });

  return {
    kommune,
    ...rest,
  };
};

export default useKommuner;
