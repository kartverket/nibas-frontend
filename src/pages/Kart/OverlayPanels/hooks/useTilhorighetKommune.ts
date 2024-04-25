import { Feature } from "ol";
import { useEffect } from "react";
import { KontekstType, Tilhorighet, UseTilhorighet } from "./tilhorighet-utils";
import { useTilhorighetForm } from "./useTilhorighetForm";
import { useGetMuligeKretserForKommuneGrense } from "pages/Kart/OverlayPanels/hooks/useGetMuligeKretserForKommuneGrense";
import { useInndelinger } from "contexts/InndelingerContext/InndelingerContext";

export const useTilhorighetKommune = (feature: Feature, kontekstType: KontekstType): UseTilhorighet => {
  const {
    setTilhorighetOptions,
    tilhorighetOptions,
    formState,
    setValue,
    isDirty,
    resetTilhorighet,
    updateDraftFromFeature,
  } = useTilhorighetForm(feature, kontekstType);
  const { selectedFylkeId } = useInndelinger();

  const { isLoading, muligeKretser } = useGetMuligeKretserForKommuneGrense(kontekstType, selectedFylkeId);

  useEffect(() => {
    if (muligeKretser != null) {
      setTilhorighetOptions({
        [Tilhorighet.A]: muligeKretser,
        [Tilhorighet.B]: muligeKretser,
      });
    }
  }, [muligeKretser, setTilhorighetOptions]);

  return {
    kontekstType,
    tilhorighetOptions,
    isDirty,
    resetTilhorighet,
    updateDraftFromFeature,
    formState,
    setValue,
    isLoading,
  };
};
