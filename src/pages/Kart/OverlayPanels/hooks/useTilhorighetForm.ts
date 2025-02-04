import { useHistory } from "contexts/HistoryContext/HistoryContext";
import { HistoryEntry } from "contexts/HistoryContext/types";
import { useInndelinger } from "contexts/InndelingerContext/InndelingerContext";
import { useUtkast } from "contexts/UtkastContext/UtkastContext";
import { historyToKretsdelingOperations } from "contexts/UtkastContext/utkast-utils";
import useNibasApi from "hooks/useNibasApi";
import { Feature } from "ol";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FeatureProperties, KontekstEgenskaper, KretsDelingEndringRequest, UtkastOperasjoner } from "types/api";
import {
  CustomOption,
  getIdForTilhorhetNyKrets,
  getKommunerIdFromKontekstEgenskaper,
  getKontekstTypeForFeature,
  getTilhorighetData,
  getUpdatedKontekstEgenskaper,
  KontekstType,
  Krets,
  Tilhorighet,
  TilhorighetForm,
  TilhorighetOptions,
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
        type: kretsDeling.flatetype === "STEMMEKRETS" ? KontekstType.STEMMEKRETS : KontekstType.GRUNNKRETS,
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

const getUpdatedNames = (
  kretser: Krets[],
  historyEntries: HistoryEntry[],
  utkastEntries: UtkastOperasjoner,
  kontekstType: KontekstType,
): Krets[] => {
  const idAndNamesHistory = historyEntries
    .flatMap((historyEntry) =>
      historyEntry.changes.map((change) => {
        if (change.to != null && "navn" in change.to) {
          return {
            id: change.id,
            name: change.to.navn,
          };
        }
      }),
    )
    .filter((entry) => entry !== undefined);

  const idAndNamesUtkast = Object.values(
    utkastEntries.metadataendringer[kontekstType === "GRUNNKRETS" ? "grunnkretsendringer" : "stemmekretsendringer"],
  ).map((grunnkretsEndring) => ({ id: grunnkretsEndring.identifikasjon.lokalid, name: grunnkretsEndring.navn }));

  const idAndNames = idAndNamesHistory.concat(idAndNamesUtkast);

  const newKretser = kretser.map((krets) => {
    const newName = idAndNames.find((idAndNameEntry) => idAndNameEntry.id === krets.id.lokalid.value)?.name;
    if (newName != null) {
      return { ...krets, navn: newName };
    } else {
      return krets;
    }
  });
  return newKretser;
};

const getKretserFromHistory = (
  entries: HistoryEntry[],
  kommunerIdOgNummer: { id: string; nummer: string }[],
  kontekstType: KontekstType,
): Krets[] => {
  const kretsdelingerEntries = getKretsDelingEntries(entries);

  const kretsdelingOperations = historyToKretsdelingOperations(kretsdelingerEntries).filter(
    (kretsdeling) => kretsdeling.flatetype === kontekstType,
  );

  return getKretserFromKretsDelingEndringer(kommunerIdOgNummer, kretsdelingOperations);
};

export const useTilhorighetForm = (feature: Feature, kontekstTypeOverride?: KontekstType) => {
  const { getHistoryEntries } = useHistory();
  const { gyldighetsdato } = useValgtGyldighetsdato();
  const { data: kommuneResponses } = useNibasApi("/v1/kommuner", { gyldighetsdato });
  const { utkast } = useUtkast();
  const previousFeature = usePrevious(feature);

  const featureProperties = feature.getProperties() as FeatureProperties;
  const kontekstEgenskaper = useMemo(
    () => featureProperties.kontekstEgenskaper.map((ke) => getIdForKontekstEgenskaper(ke, utkast?.operasjoner)), // kontekster som peker til nye kretser i utkastet har undefined som id. Vi må gi disse en unik id også som kan brukes i formet.
    [featureProperties.kontekstEgenskaper, utkast],
  );
  const kontekstType = kontekstTypeOverride ?? getKontekstTypeForFeature(kontekstEgenskaper, featureProperties);
  const { currentlyEditingInndelinger } = useInndelinger();

  // Her aner jeg ikke hvordan vi skal håndtere flere potensielle aktivt redigerte inndelinger
  const kommunerId = useMemo(
    () =>
      getKommunerIdFromKontekstEgenskaper(
        kontekstEgenskaper.filter((k) => k.id?.lokalid.value !== CustomOption.NOT_CHOSEN),
        kontekstType,
      ) ?? [currentlyEditingInndelinger?.[0] != null ? currentlyEditingInndelinger[0].id : ""],
    [kontekstType, currentlyEditingInndelinger, kontekstEgenskaper],
  );

  const kommunerIdOgNummer: { id: string; nummer: string }[] = useMemo(() => {
    if (kommuneResponses == null) {
      return [];
    }

    return kommuneResponses
      .filter((kommune) => kommunerId.some((id) => id === kommune.id.lokalid.value))
      .map((kommune) => ({ id: kommune.id.lokalid.value, nummer: kommune.nummer }));
  }, [kommuneResponses, kommunerId]);

  const [tilhorighetOptions, setTilhorighetValg] = useState<TilhorighetOptions>();

  // wrapper for setter av tilhørighetoptions. Spreader inn nye kretser i hver dropdown.
  const setTilhorighetOptions = useCallback(
    (commonOptions: TilhorighetOptions | undefined) => {
      if (utkast && commonOptions) {
        const tilhorighetOptionsFromUtkast = getKretserFromKretsDelingEndringer(
          kommunerIdOgNummer,
          utkast.operasjoner.kretsDelingEndringer.filter((deling) => deling.flatetype === kontekstType),
        );
        const tihorighetOptionsFromHistory = getKretserFromHistory(
          getHistoryEntries(),
          kommunerIdOgNummer,
          kontekstType,
        );
        const ListeA: Krets[] = [
          ...commonOptions[Tilhorighet.A],
          ...tilhorighetOptionsFromUtkast,
          ...tihorighetOptionsFromHistory,
        ];
        const ListeB: Krets[] = [
          ...commonOptions[Tilhorighet.A],
          ...tilhorighetOptionsFromUtkast,
          ...tihorighetOptionsFromHistory,
        ];
        setTilhorighetValg({
          [Tilhorighet.A]: getUpdatedNames(ListeA, getHistoryEntries(), utkast.operasjoner, kontekstType),
          [Tilhorighet.B]: getUpdatedNames(ListeB, getHistoryEntries(), utkast.operasjoner, kontekstType),
        });
      } else if (!utkast && commonOptions) {
        setTilhorighetValg(commonOptions);
      }
    },
    [kommunerIdOgNummer, kontekstType, utkast, getHistoryEntries],
  );

  const [formState, setFormState] = useState<TilhorighetForm>(getTilhorighetData(kontekstEgenskaper));
  const setValue = (tilhorighet: Tilhorighet, value: string | undefined) => {
    const newState = { ...formState };
    newState[kontekstType][tilhorighet] = value;
    setFormState(newState);
  };

  const isDirty = useMemo(() => {
    const initialData = getTilhorighetData(kontekstEgenskaper);

    const grunnkretsIsDirty =
      initialData[KontekstType.GRUNNKRETS][Tilhorighet.A] !== formState[KontekstType.GRUNNKRETS][Tilhorighet.A] ||
      initialData[KontekstType.GRUNNKRETS][Tilhorighet.B] !== formState[KontekstType.GRUNNKRETS][Tilhorighet.B];
    const stemmekretsIsDirty =
      initialData[KontekstType.STEMMEKRETS][Tilhorighet.A] !== formState[KontekstType.STEMMEKRETS][Tilhorighet.A] ||
      initialData[KontekstType.STEMMEKRETS][Tilhorighet.B] !== formState[KontekstType.STEMMEKRETS][Tilhorighet.B];

    return stemmekretsIsDirty || grunnkretsIsDirty;
  }, [formState, kontekstEgenskaper]);

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
      return getUpdatedKontekstEgenskaper(kontekstType, formState[kontekstType], tilhorighetOptions);
    }
  };

  return {
    setTilhorighetOptions,
    tilhorighetOptions,
    formState,
    setValue,
    isDirty,
    resetTilhorighet,
    kommunerId,
    kontekstType,
    getCurrentOppdaterteKontekstEgenskaper,
  };
};
