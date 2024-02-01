import { useKommuneGrunnkretser } from "hooks/inndelinger/useGrunnkretser";
import { useKommuneStemmekretser } from "hooks/inndelinger/useStemmekretser";
import { Feature } from "ol";
import { useEffect } from "react";
import { GrunnkretsResponse, StemmekretsResponse } from "types/api";
import { KontekstType, Krets, TilhorighetOptions, getTilhorighetData } from "./tilhorighetUtils";
import { useTilhorighetForm } from "./useTilhorighetForm";

// Tar api respons for grunnkretser og stemmekretser og gir det tilbake på Krets typen pakket inn i TilhorighetOptions
const getMuligeKretserForGrense = (
  kontekstType: KontekstType,
  grunnkretser: GrunnkretsResponse[],
  stemmekretser: StemmekretsResponse[],
): TilhorighetOptions => {
  if (kontekstType === KontekstType.STEMMEKRETS) {
    const mappedStemmekretser = stemmekretser.map(
      ({ id, version, stemmekretsnummer, stemmekretsnavn, kommuneIdentifikator }) => ({
        id,
        kommuneId: kommuneIdentifikator,
        version,
        nummer: stemmekretsnummer,
        navn: stemmekretsnavn,
        type: KontekstType.STEMMEKRETS,
      }),
    ) as Krets[];
    return {
      a: mappedStemmekretser,
      b: mappedStemmekretser,
    };
  } else {
    const mappedGrunnkretser = grunnkretser.map(({ id, version, grunnkretsnummer, navn, kommuneIdentifikator }) => ({
      id,
      kommuneId: kommuneIdentifikator,
      version,
      nummer: grunnkretsnummer,
      navn: navn,
      type: KontekstType.GRUNNKRETS,
    })) as Krets[];
    return {
      a: mappedGrunnkretser,
      b: mappedGrunnkretser,
    };
  }
};

export const useTilhorighet = (feature: Feature) => {
  const {
    setTilhorighetOptions,
    tilhorighetOptions,
    register,
    getValues,
    isDirty,
    resetTilhorighet,
    updateDraftFromFeature,
    kommunerId,
    kontekstType,
  } = useTilhorighetForm(feature);

  const { data: grunnkretser } = useKommuneGrunnkretser(kommunerId[0]);
  const { data: stemmekretser } = useKommuneStemmekretser(kommunerId[0]);

  useEffect(() => {
    if (grunnkretser && stemmekretser) {
      setTilhorighetOptions(getMuligeKretserForGrense(kontekstType, grunnkretser, stemmekretser));
    }
  }, [grunnkretser, stemmekretser, kontekstType, setTilhorighetOptions]);

  return {
    kontekstType,
    data: tilhorighetOptions,
    isDirty,
    register,
    resetTilhorighet,
    getTilhorighetData,
    updateDraftFromFeature,
    getValues,
  };
};
