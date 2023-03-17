import { useUtkast } from "contexts/UtkastContext";
import { Grunnkretsendringer } from "./utkastEndringerTypes";
import { useEffect, useMemo, useState } from "react";
import { useToolbar } from "contexts/ToolbarContext";
import { historyToUtkastOperations } from "contexts/UtkastContext/utils";
import useNibasApi from "hooks/useNibasApi";
import {
  getGrunnkretsEndringer,
  getGrunnkretserMedEndringer,
} from "./grunnkretsEndringerUtils";
import { useGrunnkretser } from "hooks/inndelinger/useGrunnkretser";

type useUtkastGrunnkretsEndringerReturnType = {
  harEndringer: boolean;
  laster: boolean;
  endringer: Grunnkretsendringer[] | null;
};

export const useUtkastGrunnkretsEndringer =
  (): useUtkastGrunnkretsEndringerReturnType => {
    const { utkast, isValidating: lasterUtkast } = useUtkast();
    const [endringer, setEndringer] = useState<Grunnkretsendringer[] | null>(
      null
    );

    const { data: kommuner, isValidating: lasterKommuner } =
      useNibasApi("/v1/kommuner");

    const { history } = useToolbar();
    const operasjoner = useMemo(() => {
      return historyToUtkastOperations(history, utkast);
    }, [history, utkast]);

    const grunnkretserMedEndringer = useMemo(() => {
      return getGrunnkretserMedEndringer(operasjoner);
    }, [operasjoner]);

    const { data: grunnkretser, isValidating: lasterGrunnkretser } =
      useGrunnkretser(grunnkretserMedEndringer);

    const lasterData = lasterUtkast || lasterGrunnkretser || lasterKommuner;

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
