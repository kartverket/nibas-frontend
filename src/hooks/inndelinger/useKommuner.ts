import useNibasApi from "../useNibasApi";

const useKommuner = (fylkeId: string, shouldFetch = true) => {
  const { data: kommuner, ...rest } = useNibasApi(shouldFetch ? "/v1/kommuner" : null, {
    fylkeid: fylkeId,
  });

  const sortedKommuner = kommuner?.sort((a, b) => {
    return Number(a.kommunenummer.kodeverdi) - Number(b.kommunenummer.kodeverdi);
  });

  return {
    kommuner: sortedKommuner,
    ...rest,
  };
};

export default useKommuner;
