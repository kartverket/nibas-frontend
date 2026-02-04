import { useHistory } from "contexts/HistoryContext/HistoryContext";
import { HistoryEntry } from "contexts/HistoryContext/types";
import { useInndelinger } from "contexts/InndelingerContext/InndelingerContext";
import { useUtkast } from "contexts/UtkastContext/UtkastContext";
import {
  getMetadataEndringerKeyForInndelingtype,
  historyToKretsdelingOperations,
} from "contexts/UtkastContext/utkast-utils";
import useNibasApi from "hooks/useNibasApi";
import { Feature } from "ol";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FeatureProperties, KontekstEgenskaper, KretsDelingEndringRequest, UtkastOperasjoner } from "types/api";
import {
  CustomOption,
  getIdForTilhorhetNyKrets,
  getKommunerIdFromKontekstEgenskaper,
  getKretsTypeForFeature,
  getTilhorighetData,
  getUpdatedKontekstEgenskaper,
  Krets,
  Tilhorighet,
  TilhorighetForm,
  TilhorighetOptions,
  TilhorighetInndelingtype,
  TILHORIGHET_INNDELINGTYPE_VALUES,
} from "./tilhorighet-utils";
import { getGrenseTilhorighetEntries, getKretsDelingEntries } from "contexts/HistoryContext/history-utils";
import { usePrevious } from "hooks/usePrevious";
import { useValgtGyldighetsdato } from "contexts/GyldighetsdatoContext";

const getKretserFromKretsDelingEndringer = (
  kommunerIdOgNummer: { id: string; nummer: string }[],
  kretsDelingEndringRequests: KretsDelingEndringRequest[],
): Krets[] => {
  return kretsDelingEndringRequests
    .filter((kretsDeling) => kommunerIdOgNummer.some(({ id }) => id === kretsDeling.kommuneId.lokalid.value))
    .flatMap((kretsDeling) =>
      kretsDeling.nyeKretser.map((nyKrets) => ({
        id: {
          lokalid: { value: getIdForTilhorhetNyKrets(nyKrets.kretsNummer, kretsDeling.kommuneId.lokalid.value) },
          gyldighetsdato: "",
        },
        kommuneId: kretsDeling.kommuneId,
        kommunenummer:
          kommunerIdOgNummer.find((idOgNummer) => idOgNummer.id === kretsDeling.kommuneId.lokalid.value)?.nummer ?? "",
        version: kretsDeling.opprinneligKrets.version,
        type: kretsDeling.flatetype as TilhorighetInndelingtype, // TODO: Backend burde redusere enum for flatetyper som er gyldig for kretsdeling.
        navn: nyKrets.kretsNavn,
        nummer: nyKrets.kretsNummer,
      })),
    );
};

const getIdForKontekstEgenskaper = (
  kontekstEgenskaper: KontekstEgenskaper,
  currentOperasjoner: UtkastOperasjoner | undefined,
): KontekstEgenskaper => {
  // Hvis konteksten har en id betyr det at den ikke peker til en nyopprettet krets, og vi kan derfor bruke den IDen for å identifisere kretsen.
  if (kontekstEgenskaper.id) {
    return kontekstEgenskaper;
  } else {
    const newKretsWithEqualKommuneAndKretsNummerExists = currentOperasjoner?.kretsDelingEndringer
      .filter((deling) => deling.kommuneId.lokalid.value === kontekstEgenskaper.kommuneId?.lokalid.value)
      .find((deling) => deling.nyeKretser.find((krets) => krets.kretsNummer === kontekstEgenskaper.kretsNummer));
    if (!newKretsWithEqualKommuneAndKretsNummerExists) {
      return {
        ...kontekstEgenskaper,
        id: {
          lokalid: { value: CustomOption.NOT_CHOSEN },
          gyldighetsdato: "",
        },
      };
      // hvis det finnes en ny krets med nummer og kommuneid lik en ny krets i utkastet OG kontekstegenskaper har id lik undefined lager vi en unik referanse til denne kretsen
    } else {
      return {
        ...kontekstEgenskaper,
        id: {
          lokalid: {
            value: getIdForTilhorhetNyKrets(
              kontekstEgenskaper.kretsNummer,
              kontekstEgenskaper.kommuneId?.lokalid.value,
            ),
          },
          gyldighetsdato: "",
        },
      };
    }
  }
};

const getUpdatedMetadata = (
  kretser: Krets[],
  historyEntries: HistoryEntry[],
  utkastEntries: UtkastOperasjoner,
  inndelingType: TilhorighetInndelingtype,
): Krets[] => {
  const metadataFromHistory = historyEntries
    .flatMap((historyEntry) =>
      historyEntry.changes.map((change) => {
        if (change.to != null && "navn" in change.to && "nummer" in change.to) {
          return {
            id: change.id,
            name: change.to.navn,
            number: change.to.nummer,
          };
        }
        return null;
      }),
    )
    .filter((entry): entry is { id: string; name: string; number: string } => entry !== null);

  const metadataFromUtkast = Object.values(
    utkastEntries.metadataendringer[getMetadataEndringerKeyForInndelingtype(inndelingType)],
  ).map((endring) => ({
    id: endring.identifikasjon.lokalid,
    name: endring.navn,
    number: endring.nummer,
  }));

  const metadataChanges = metadataFromHistory.concat(metadataFromUtkast);

  return kretser.map((krets) => {
    const matchingChange = metadataChanges.find((entry) => entry.id === krets.id.lokalid.value);

    if (matchingChange !== undefined) {
      return { ...krets, navn: matchingChange.name, nummer: matchingChange.number };
    }

    return krets;
  });
};

const getKretserFromHistory = (
  entries: HistoryEntry[],
  kommunerIdOgNummer: { id: string; nummer: string }[],
  inndelingType: TilhorighetInndelingtype,
): Krets[] => {
  const kretsdelingerEntries = getKretsDelingEntries(entries);

  const kretsdelingOperations = historyToKretsdelingOperations(kretsdelingerEntries).filter(
    (kretsdeling) => kretsdeling.flatetype === inndelingType,
  );
  return getKretserFromKretsDelingEndringer(kommunerIdOgNummer, kretsdelingOperations);
};

export const useTilhorighetForm = (feature: Feature, inndelingTypeOverride?: TilhorighetInndelingtype) => {
  const { getHistoryEntries } = useHistory();
  const { gyldighetsdato } = useValgtGyldighetsdato();
  const { data: kommuneResponses, isLoading } = useNibasApi("/v1/kommuner", { gyldighetsdato });
  const { utkast } = useUtkast();
  const previousFeature = usePrevious(feature);

  const featureProperties = feature.getProperties() as FeatureProperties;
  const kontekstEgenskaper = useMemo(
    () => featureProperties.kontekstEgenskaper.map((ke) => getIdForKontekstEgenskaper(ke, utkast?.operasjoner)), // kontekster som peker til nye kretser i utkastet har undefined som id. Vi må gi disse en unik id også som kan brukes i formet.
    [featureProperties.kontekstEgenskaper, utkast],
  );
  const inndelingType = inndelingTypeOverride ?? getKretsTypeForFeature(kontekstEgenskaper, featureProperties);
  const { currentlyEditingInndelinger } = useInndelinger();

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
  const [tilhorighetOptions, setTilhorighetValg] = useState<TilhorighetOptions>();

  // wrapper for setter av tilhørighetoptions. Spreader inn nye kretser i hver dropdown.
  const setTilhorighetOptions = useCallback(
    (commonOptions: TilhorighetOptions | undefined) => {
      if (utkast && commonOptions) {
        const tilhorighetOptionsFromUtkast = getKretserFromKretsDelingEndringer(
          kommunerIdOgNummer,
          utkast.operasjoner.kretsDelingEndringer.filter((deling) => deling.flatetype === inndelingType),
        );
        const historyEntries = getHistoryEntries();
        const tilhorighetOptionsFromHistory = getKretserFromHistory(historyEntries, kommunerIdOgNummer, inndelingType);

        const listeA: Krets[] = [
          ...commonOptions[Tilhorighet.A],
          ...tilhorighetOptionsFromUtkast,
          ...tilhorighetOptionsFromHistory,
        ];
        const listeB: Krets[] = [
          ...commonOptions[Tilhorighet.B],
          ...tilhorighetOptionsFromUtkast,
          ...tilhorighetOptionsFromHistory,
        ];

        setTilhorighetValg({
          [Tilhorighet.A]: getUpdatedMetadata(listeA, historyEntries, utkast.operasjoner, inndelingType),
          [Tilhorighet.B]: getUpdatedMetadata(listeB, historyEntries, utkast.operasjoner, inndelingType),
        });
      } else if (!utkast && commonOptions) {
        setTilhorighetValg(commonOptions);
      }
    },
    [kommunerIdOgNummer, inndelingType, utkast, getHistoryEntries],
  );

  const [formState, setFormState] = useState<TilhorighetForm>(getTilhorighetData(kontekstEgenskaper));
  const setValue = (tilhorighet: Tilhorighet, value: string | undefined) => {
    const newState = { ...formState };
    newState[inndelingType][tilhorighet] = value;
    setFormState(newState);
  };

  const isDirty = () => {
    const initialData = getTilhorighetData(kontekstEgenskaper);
    return TILHORIGHET_INNDELINGTYPE_VALUES.some(
      (type) =>
        initialData[type][Tilhorighet.A] !== formState[type][Tilhorighet.A] ||
        initialData[type][Tilhorighet.B] !== formState[type][Tilhorighet.B],
    );
  };

  const resetTilhorighet = useCallback(() => {
    const tilhorighetchangesForKrets = getGrenseTilhorighetEntries(getHistoryEntries())
      .flatMap((entry) => entry.changes)
      .findLast((change) => change.id === feature.getId());

    if (tilhorighetchangesForKrets != null) {
      setFormState(getTilhorighetData(tilhorighetchangesForKrets.to));
    } else {
      setFormState(getTilhorighetData(kontekstEgenskaper));
    }
  }, [feature, getHistoryEntries, kontekstEgenskaper]);

  useEffect(() => {
    if (previousFeature?.getId() !== feature.getId()) {
      resetTilhorighet();
    }
  }, [feature, previousFeature, resetTilhorighet]);

  const getCurrentOppdaterteKontekstEgenskaper = () => {
    if (tilhorighetOptions) {
      return getUpdatedKontekstEgenskaper(inndelingType, formState[inndelingType], tilhorighetOptions);
    }
  };

  return {
    setTilhorighetOptions,
    tilhorighetOptions,
    formState,
    setValue,
    isDirty: isDirty(),
    resetTilhorighet,
    kommunerIds,
    inndelingType,
    getCurrentOppdaterteKontekstEgenskaper,
    isLoading,
  };
};
