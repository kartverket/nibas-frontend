import useNibasApi from "../useNibasApi";
import { sortGrenserAlphabetically } from "utils/language/language";

const useKommuner = (fylkeId: string, shouldFetch = true) => {
  const { data: kommuner, ...rest } = useNibasApi(
    shouldFetch ? "/v1/kommuner" : null,
    { fylkeid: fylkeId },
    { revalidateIfStale: false },
  );

  const sortedKommuner = sortGrenserAlphabetically(kommuner ?? []);

  return {
    kommuner: sortedKommuner,
    ...rest,
  };
};

export default useKommuner;
