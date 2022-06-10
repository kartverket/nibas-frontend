import useNibasApi from "../useNibasApi";
import { sortGrenserAlphabetically } from "utils/language/language";

const useFylker = () => {
  const { data: fylker, ...rest } = useNibasApi("/v1/fylker");
  const sortedFylker = sortGrenserAlphabetically(fylker);

  return {
    fylker: sortedFylker,
    ...rest,
  };
};

export default useFylker;
