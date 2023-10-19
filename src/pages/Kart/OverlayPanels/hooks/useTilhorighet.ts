import { useKommuneGrunnkretser } from "hooks/inndelinger/useGrunnkretser";
import { useKommuneStemmekretser } from "hooks/inndelinger/useStemmekretser";
import { GrenseType } from "hooks/layers/types";
import { useEffect, useState } from "react";
import { GrunnkretsResponse, StemmekretsResponse } from "types/api";

type Krets = {
  id: {
    lokalid: {
      value: string;
    };
    gyldighetsdato: string;
  };
  kretsNummer: string;
  navn: string;
};
type TilhorighetOptions = Krets[];

const getMuligeKretserForGrense = (
  grenseType: GrenseType,
  grunnkretser: GrunnkretsResponse[],
  stemmekretser: StemmekretsResponse[],
): Krets[] => {
  if (grenseType == "Stemmekretsgrense") {
    return stemmekretser.map((stemmekrets) => {
      return {
        id: stemmekrets.id,
        kretsNummer: stemmekrets.stemmekretsnummer,
        navn: stemmekrets.stemmekretsnavn,
      };
    });
  } else {
    return grunnkretser.map((grunnkrets) => {
      return {
        id: grunnkrets.id,
        kretsNummer: grunnkrets.grunnkretsnummer,
        navn: grunnkrets.navn,
      };
    });
  }
};

export const useTilhorighet = (grenseType: GrenseType, kommuneId: string) => {
  const { data: grunnkretser } = useKommuneGrunnkretser(kommuneId);
  const { data: stemmekretser } = useKommuneStemmekretser(kommuneId);
  const [tilhorighetOptions, setTilhorighetOptions] =
    useState<TilhorighetOptions>();

  useEffect(() => {
    if (grunnkretser && stemmekretser) {
      setTilhorighetOptions(
        getMuligeKretserForGrense(grenseType, grunnkretser, stemmekretser),
      );
    }
  }, [grenseType, grunnkretser, stemmekretser]);

  return tilhorighetOptions;
};
