import { UtkastResponse } from "../../../types/api";
import { Kretsendringer } from "components/Endringslogg/hooks/utkastEndringerTypes";
import { getGrenserndringerUtenTilhorighet } from "components/Endringslogg/hooks/endringerUtils";

type UseUtkastKommuneEndringerReturnType = {
  harEndringer: boolean;
  endringer: Kretsendringer | null;
};

export const useUtkastUtenTilhorighetEndringer = (utkast: UtkastResponse): UseUtkastKommuneEndringerReturnType => {
  const endringer = getGrenserndringerUtenTilhorighet(utkast.operasjoner);

  return {
    harEndringer: endringer.antallNyeGrenser > 0 || endringer.antallEndredeGrenser > 0,
    endringer: endringer,
  };
};
