import { useUtkast } from "contexts/UtkastContext";
import { Stemmekretsendringer } from "./utkastEndringerTypes";
import {
  getStemmekretserMedEndringer,
  getStemmekretsEndringer,
} from "./stemmekretsEndringerUtils";
import { useEffect, useMemo, useState } from "react";
import { useStemmekretser } from "hooks/inndelinger/useStemmekretser";
import { useToolbar } from "contexts/ToolbarContext";
import { historyToUtkastOperations } from "contexts/UtkastContext/utils";
import useNibasApi from "hooks/useNibasApi";

type useUtkastStemmekretsEndringerReturnType = {
  harEndringer: boolean;
  laster: boolean;
  endringer: Stemmekretsendringer[] | null;
};

export const useUtkastStemmekretsEndringer =
  (): useUtkastStemmekretsEndringerReturnType => {
    const { utkast, isValidating: lasterUtkast } = useUtkast();
    const [endringer, setEndringer] = useState<Stemmekretsendringer[] | null>(
      null
    );

    const { data: kommuner, isValidating: lasterKommuner } =
      useNibasApi("/v1/kommuner");

    const { history } = useToolbar();
    const operasjoner = useMemo(() => {
      return historyToUtkastOperations(history, utkast);
    }, [history, utkast]);

    const stemmekretserMedEndringer = useMemo(() => {
      return getStemmekretserMedEndringer(operasjoner);
    }, [operasjoner]);

    const { data: stemmekretser, isValidating: lasterStemmekretser } =
      useStemmekretser(stemmekretserMedEndringer);

    const lasterData = lasterUtkast || lasterStemmekretser || lasterKommuner;

    useEffect(() => {
      if (!lasterData && stemmekretser && kommuner) {
        setEndringer(
          getStemmekretsEndringer(
            stemmekretserMedEndringer,
            operasjoner,
            stemmekretser,
            kommuner
          )
        );
      }
    }, [
      stemmekretserMedEndringer,
      operasjoner,
      kommuner,
      lasterData,
      stemmekretser,
    ]);

    return {
      harEndringer: stemmekretserMedEndringer.length > 0,
      laster: lasterData,
      endringer,
    };
  };
