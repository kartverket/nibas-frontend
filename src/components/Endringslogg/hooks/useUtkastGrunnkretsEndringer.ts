import { Grunnkretsendringer } from "./utkastEndringerTypes";
import { useEffect, useMemo, useState } from "react";
import { useHistory } from "contexts/HistoryContext";
import { historyToUtkastOperations } from "contexts/UtkastContext/utils";
import useNibasApi from "hooks/useNibasApi";
import {
  getGrunnkretsEndringer,
  getGrunnkretserMedEndringer,
} from "./grunnkretsEndringerUtils";
import { useGrunnkretser } from "hooks/inndelinger/useGrunnkretser";
import { UtkastResponse } from "types/api";

type useUtkastGrunnkretsEndringerReturnType = {
  harEndringer: boolean;
  laster: boolean;
  endringer: Grunnkretsendringer[] | null;
};

export const useUtkastGrunnkretsEndringer = (
  utkast: UtkastResponse
): useUtkastGrunnkretsEndringerReturnType => {
  const [endringer, setEndringer] = useState<Grunnkretsendringer[] | null>(
    null
  );

  const { data: kommuner, isValidating: lasterKommuner } =
    useNibasApi("/v1/kommuner");

  const { history } = useHistory();
  const operasjoner = useMemo(() => {
    return historyToUtkastOperations(history, utkast);
  }, [history, utkast]);

  const grunnkretserMedEndringer = useMemo(() => {
    return getGrunnkretserMedEndringer(operasjoner);
  }, [operasjoner]);

  const { data: grunnkretser, isValidating: lasterGrunnkretser } =
    useGrunnkretser(grunnkretserMedEndringer);

  const lasterData = lasterGrunnkretser || lasterKommuner;

  useEffect(() => {
    if (!lasterData && grunnkretser && kommuner) {
      setEndringer(
        getGrunnkretsEndringer(
          grunnkretserMedEndringer,
          operasjoner,
          grunnkretser,
          kommuner
        )
      );
    }
  }, [
    grunnkretserMedEndringer,
    operasjoner,
    kommuner,
    lasterData,
    grunnkretser,
  ]);

  return {
    harEndringer: grunnkretserMedEndringer.length > 0,
    laster: lasterData,
    endringer,
  };
};
