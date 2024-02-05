import useNibasApi from "../useNibasApi";
import { sortGrenserAlphabetically } from "utils/language/language";

const useFylker = (shouldFetch = true) => {
  const { data: fylker, ...rest } = useNibasApi(shouldFetch ? "/v1/fylker" : null);
  const sortedFylker = sortGrenserAlphabetically(fylker);

  return {
    fylker: sortedFylker,
    ...rest,
  };
};

export default useFylker;
