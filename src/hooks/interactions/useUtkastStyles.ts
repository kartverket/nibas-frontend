import { useEffect, useState } from "react";
import { editSource } from "hooks/layers/constants";
import { dirtyStyles, editStyles } from "utils/map/layerStyles";

const useUtkastStyles = (utkastFeatureIds: string[]) => {
  const [featureIdsWithUtkastStyles, setFeatureIdsWithDirtyStyle] = useState<
    string[]
  >([]);

  //TO DO: Når man går ut av et utkast, så skal alle disse features fjernes

  //TO DO: Når det legges til features i listen så skal de oppdateres

  //Trenger egentlig bare å håndtere legge til og fjerning, også må det bare cleares og legges til riktig ellers
  //i appen

  //egentlig må jeg bare endre hvordan dirty styles brukes
};

export default useUtkastStyles;
