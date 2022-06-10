import useNibasApi from "../useNibasApi";
import { KommuneRef } from "types/api";
import { sortGrenserAlphabetically } from "utils/language/language";

const useKommuner = (fylkeId: string) => {
  const { data: kommuner, ...rest } = useNibasApi("/v1/kommuner", {
    fylkeid: fylkeId,
  });

  const sortedKommuner = sortGrenserAlphabetically(kommuner) as KommuneRef[];

  return {
    kommuner: sortedKommuner,
    ...rest,
  };
};

export default useKommuner;
