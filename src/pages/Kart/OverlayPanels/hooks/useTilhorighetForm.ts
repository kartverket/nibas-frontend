import { useValgtGyldighetsdato } from "contexts/GyldighetsdatoContext";
import { useHistory } from "contexts/HistoryContext/HistoryContext";
import { useInndelinger } from "contexts/InndelingerContext/InndelingerContext";
import { useUtkast } from "contexts/UtkastContext/UtkastContext";
import useNibasApi from "hooks/useNibasApi";
import { Feature } from "ol";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FeatureProperties } from "types/api";
import {
  getIdForKontekstEgenskaper,
  getKommunerIdFromKontekstEgenskaper,
  getKretserFromHistory,
  getKretserFromKretsDelingEndringer,
  getKretsTypeForFeature,
  getNyeInndelingerFromUtkast,
  getTilhorighetData,
  getUpdatedMetadataForKretser,
  Krets,
  Tilhorighet,
  TILHORIGHET_INNDELINGTYPE_VALUES,
  TilhorighetForm,
  TilhorighetInndelingtype,
  TilhorighetOptions,
} from "./tilhorighet-utils";

export const useTilhorighetForm = (feature: Feature, inndelingTypeOverride?: TilhorighetInndelingtype) => {
  const { getHistoryEntries } = useHistory();
  const { gyldighetsdato } = useValgtGyldighetsdato();
  const { data: kommuneResponses, isLoading } = useNibasApi("/v1/kommuner", { gyldighetsdato });
  const { utkast } = useUtkast();

  const featureProperties = feature.getProperties() as FeatureProperties;
  const kontekstEgenskaper = useMemo(
    () => featureProperties.kontekstEgenskaper.map((ke) => getIdForKontekstEgenskaper(ke, utkast?.operasjoner)), // kontekster som peker til nye kretser i utkastet har undefined som id. Vi må gi disse en unik id også som kan brukes i formet.
    [featureProperties.kontekstEgenskaper, utkast],
  );
  const inndelingType = inndelingTypeOverride ?? getKretsTypeForFeature(kontekstEgenskaper, featureProperties);
  const { currentlyEditingInndelinger } = useInndelinger();

  const [formState, setFormState] = useState<TilhorighetForm>(getTilhorighetData(kontekstEgenskaper));
  const setValue = (tilhorighet: Tilhorighet, value: string | undefined) => {
    const newState = { ...formState };
    newState[inndelingType][tilhorighet] = value;
    setFormState(newState);
  };

  // Her aner jeg ikke hvordan vi skal håndtere flere potensielle aktivt redigerte inndelinger
  const kommunerIds = useMemo(() => {
    const fromKontekst = getKommunerIdFromKontekstEgenskaper(kontekstEgenskaper, inndelingType) ?? [];
    const fromInndelinger = currentlyEditingInndelinger?.map((i) => i.id) ?? [];
    const allIds = Array.from(new Set([...fromKontekst, ...fromInndelinger]));
    return allIds.length > 0 ? allIds : [""];
  }, [kontekstEgenskaper, inndelingType, currentlyEditingInndelinger]);

  const kommunerIdOgNummer: { id: string; nummer: string }[] = useMemo(() => {
    if (kommuneResponses == null) {
      return [];
    }

    return kommuneResponses
      .filter((kommune) => kommunerIds.some((id) => id === kommune.id.lokalid.value))
      .map((kommune) => ({ id: kommune.id.lokalid.value, nummer: kommune.nummer }));
  }, [kommuneResponses, kommunerIds]);

  // wrapper for setter av tilhørighetoptions. Spreader inn nye kretser i hver dropdown.
  const buildTilhorighetOptions = useCallback(
    (baseOptions: TilhorighetOptions | undefined): TilhorighetOptions | undefined => {
      if (!baseOptions) {
        return undefined;
      }

      if (!utkast) {
        return baseOptions;
      }

      const kretsDelingerFromUtkast = getKretserFromKretsDelingEndringer(
        kommunerIdOgNummer,
        utkast.operasjoner.kretsDelingEndringer.filter((deling) => deling.flatetype === inndelingType),
      );
      const nyeInndelingerFromUtkast = getNyeInndelingerFromUtkast(
        kommunerIdOgNummer,
        utkast.operasjoner,
        inndelingType,
      );

      const tilhorighetOptionsFromUtkast = [...kretsDelingerFromUtkast, ...nyeInndelingerFromUtkast];

      const historyEntries = getHistoryEntries();
      const tilhorighetOptionsFromHistory = getKretserFromHistory(historyEntries, kommunerIdOgNummer, inndelingType);
      const optionsFromUtkastAndHistory = [...tilhorighetOptionsFromUtkast, ...tilhorighetOptionsFromHistory];
      const listeA: Krets[] = getUpdatedMetadataForKretser(
        [...baseOptions[Tilhorighet.A], ...optionsFromUtkastAndHistory],
        historyEntries,
        utkast.operasjoner,
        inndelingType,
      );
      const listeB: Krets[] = getUpdatedMetadataForKretser(
        [...baseOptions[Tilhorighet.B], ...optionsFromUtkastAndHistory],
        historyEntries,
        utkast.operasjoner,
        inndelingType,
      );

      return {
        [Tilhorighet.A]: listeA,
        [Tilhorighet.B]: listeB,
      };
    },
    [kommunerIdOgNummer, inndelingType, utkast, getHistoryEntries],
  );

  const isDirty = () => {
    const initialData = getTilhorighetData(kontekstEgenskaper);
    return TILHORIGHET_INNDELINGTYPE_VALUES.some(
      (type) =>
        initialData[type][Tilhorighet.A] !== formState[type][Tilhorighet.A] ||
        initialData[type][Tilhorighet.B] !== formState[type][Tilhorighet.B],
    );
  };

  const resetTilhorighet = useCallback(() => {
    setFormState(getTilhorighetData(kontekstEgenskaper));
  }, [kontekstEgenskaper]);

  useEffect(() => {
    resetTilhorighet();
  }, [feature, resetTilhorighet]);

  return {
    buildTilhorighetOptions,
    formState,
    setValue,
    isDirty: isDirty(),
    resetTilhorighet,
    kommunerIds,
    inndelingType,
    isLoading,
  };
};
