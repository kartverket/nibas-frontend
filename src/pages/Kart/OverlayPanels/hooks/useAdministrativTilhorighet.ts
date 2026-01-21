import { Feature } from "ol";
import { useEffect } from "react";
import { useInndelinger } from "../../../../contexts/InndelingerContext/InndelingerContext";
import { FeatureProperties } from "../../../../types/api";
import {
  CustomOption,
  getKommunerIdFromKontekstEgenskaper,
  mapGrunnkretsResponseToKrets,
  mapStemmekretResponseToKrets,
  Tilhorighet,
  TilhorighetInndelingtype,
  UseTilhorighet,
} from "./tilhorighet-utils";
import { useTilhorighetForm } from "./useTilhorighetForm";
import { useValgtGyldighetsdato } from "../../../../contexts/GyldighetsdatoContext";
import useNibasApi from "../../../../hooks/useNibasApi";

// Bopliktgrenser er ikke med i administrativ tilhorighet da de ikke deltar i delt geometri.
type InndelingForAdministrativGrense = Exclude<TilhorighetInndelingtype, "BOPLIKTOMRAADE">;

const useGetMuligeKretserForAdministrativGrense = (
  inndelingType: InndelingForAdministrativGrense,
  kommuneId: string | null | undefined,
) => {
  const { gyldighetsdato } = useValgtGyldighetsdato();
  const urlForKrets =
    inndelingType === "GRUNNKRETS" ? "/v1/kommuner/{id}/grunnkretser" : "/v1/kommuner/{id}/stemmekretser";
  const url = kommuneId != null ? urlForKrets : null;

  const { data, isLoading } = useNibasApi(url, { id: kommuneId!, gyldighetsdato });

  const kretserForFylket = (() => {
    if (data == null) {
      return [];
    }

    switch (inndelingType) {
      case "STEMMEKRETS":
        return mapStemmekretResponseToKrets(data);
      case "GRUNNKRETS":
        return mapGrunnkretsResponseToKrets(data);
    }
  })();

  return {
    muligeKretser: kretserForFylket,
    isLoading,
  };
};

export const useAdministrativTilhorighet = (
  feature: Feature,
  inndelingType: InndelingForAdministrativGrense,
): UseTilhorighet => {
  const {
    setTilhorighetOptions,
    tilhorighetOptions,
    formState,
    setValue,
    isDirty,
    resetTilhorighet,
    getCurrentOppdaterteKontekstEgenskaper,
    isLoading,
  } = useTilhorighetForm(feature, inndelingType);
  const { currentlyEditingInndelinger } = useInndelinger();

  // Sjekker både kontekstEgenskaper og currentlyEditingInndelinger for å få med alle kommunerId
  const kommunerId = () => {
    const fromKontekst =
      getKommunerIdFromKontekstEgenskaper(
        (feature.getProperties() as FeatureProperties).kontekstEgenskaper.filter(
          (k) => k.id?.lokalid.value !== CustomOption.NOT_CHOSEN,
        ),
        inndelingType,
      ) ?? [];
    const fromInndelinger = currentlyEditingInndelinger?.map((i) => i.id) ?? [];
    // Slå sammen kommuneid'er fra kontekstegenskaper og inndelinger og fjern duplikater
    const allIds = Array.from(new Set([...fromKontekst, ...fromInndelinger]));
    return allIds.length > 0 ? allIds : [""];
  };

  const kommunerIds = kommunerId();

  const { isLoading: isLoadingA, muligeKretser: muligeKretserA } = useGetMuligeKretserForAdministrativGrense(
    inndelingType,
    kommunerIds[0],
  );
  const { isLoading: isLoadingB, muligeKretser: muligeKretserB } = useGetMuligeKretserForAdministrativGrense(
    inndelingType,
    kommunerIds[1],
  );

  useEffect(() => {
    const muligeKretser = muligeKretserA.concat(muligeKretserB);
    setTilhorighetOptions({
      [Tilhorighet.A]: muligeKretser,
      [Tilhorighet.B]: muligeKretser,
    });
  }, [muligeKretserA, muligeKretserB, setTilhorighetOptions]);

  return {
    inndelingType,
    tilhorighetOptions,
    isDirty,
    resetTilhorighet,
    formState,
    setValue,
    isLoading: isLoadingA || isLoadingB || isLoading,
    getCurrentOppdaterteKontekstEgenskaper,
  };
};
