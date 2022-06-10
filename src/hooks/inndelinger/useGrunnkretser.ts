import useNibasApi from "../useNibasApi";
import { sortGrenserAlphabetically } from "utils/language/language";

const useGrunnkretser = (kommunenummer?: string) => {
  const { data: grunnkretser, ...rest } = useNibasApi("/v1/grunnkretser", {
    kommunenummer,
  });

  const sortedGrunnkretser = sortGrenserAlphabetically(grunnkretser);

  return {
    grunnkretser: sortedGrunnkretser,
    ...rest,
  };
};

export default useGrunnkretser;
