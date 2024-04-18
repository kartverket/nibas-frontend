import { useCallback, useMemo, useState } from "react";
import { FeatureProperties, KontekstEgenskaper, KretsDelingEndringRequest, UtkastOperasjoner } from "types/api";
import {
  CustomOption,
  getKommunerIdFromKontekstEgenskaper,
  getTilhorighetData,
  getUpdatedKontekstEgenskaper,
  KontekstType,
  Krets,
  Tilhorighet,
  TilhorighetForm,
  TilhorighetOptions,
} from "./tilhorighet-utils";
import { useHistory } from "contexts/HistoryContext/HistoryContext";
import { Feature } from "ol";
import { LineString } from "ol/geom";
import { addKontekstEntryFromFeature } from "../GrenseinformasjonPanel/grenseinformasjon-utils";
import { useUtkast } from "contexts/UtkastContext/UtkastContext";
import { isGrenseType } from "utils/type-utils";
import { GrenseType } from "hooks/layers/types";
import { useInndelinger } from "contexts/InndelingerContext/InndelingerContext";
import useNibasApi from "hooks/useNibasApi";

const mapGrenseTypeTilKontekstType = (grenseType: GrenseType): KontekstType => {
  switch (grenseType) {
    case "Stemmekretsgrense":
      return KontekstType.STEMMEKRETS;
    default:
      return KontekstType.GRUNNKRETS;
  }
};

const getKretserFromKretsDelingEndringer = (
  kommunerIdOgNummer: { id: string; nummer: string }[],
  kretsDelingEndringRequests: KretsDelingEndringRequest[],
): Krets[] => {
  return kretsDelingEndringRequests
    .filter((kretsDeling) => kommunerIdOgNummer.some(({ id }) => id === kretsDeling.kommuneId.lokalid.value))
    .flatMap((kretsDeling) =>
      kretsDeling.nyeKretser.map((nyKrets) => ({
        id: {
          lokalid: { value: `NY_KRETS_${nyKrets.kretsNummer}_${kretsDeling.kommuneId.lokalid.value}` },
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
    } else
      return {
        ...kontekstEgenskaper,
        id: {
          lokalid: {
            value: `NY_KRETS_${kontekstEgenskaper.kretsNummer}_${kontekstEgenskaper.kommuneId?.lokalid.value}`,
          },
          gyldighetsdato: "",
        },
      };
  }
};

const getKontekstTypeForFeature = (
  kontekstgenskaper: KontekstEgenskaper[],
  featureProperties: FeatureProperties,
): KontekstType => {
  return (
    kontekstgenskaper.map((k) => k.type as KontekstType)[0] ??
    (isGrenseType(featureProperties.type) && mapGrenseTypeTilKontekstType(featureProperties.type))
  );
};

export const useTilhorighetForm = (feature: Feature, kontekstTypeOverride?: KontekstType) => {
  const { addHistoryEntry } = useHistory();
  const { data: kommuneResponses } = useNibasApi("/v1/kommuner");
  const { utkast } = useUtkast();

  const featureProperties = feature.getProperties() as FeatureProperties;
  const kontekstEgenskaper = useMemo(
    () => featureProperties.kontekstEgenskaper.map((ke) => getIdForKontekstEgenskaper(ke, utkast?.operasjoner)), // kontekster som peker til nye kretser i utkastet har undefined som id. Vi må gi disse en unik id også som kan brukes i formet.
    [featureProperties.kontekstEgenskaper, utkast],
  );
  const kontekstType = kontekstTypeOverride ?? getKontekstTypeForFeature(kontekstEgenskaper, featureProperties);
  const { currentlyEditedInndeling } = useInndelinger();

  const kommunerId = useMemo(
    () =>
      getKommunerIdFromKontekstEgenskaper(
        kontekstEgenskaper.filter((k) => k.id?.lokalid.value !== CustomOption.NOT_CHOSEN),
        kontekstType,
      ) ?? [currentlyEditedInndeling != null ? currentlyEditedInndeling.id : ""],
    [kontekstType, currentlyEditedInndeling, kontekstEgenskaper],
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
        setTilhorighetValg({
          [Tilhorighet.A]: [...commonOptions[Tilhorighet.A], ...tilhorighetOptionsFromUtkast],
          [Tilhorighet.B]: [...commonOptions[Tilhorighet.B], ...tilhorighetOptionsFromUtkast],
        });
      } else if (!utkast && commonOptions) {
        setTilhorighetValg(commonOptions);
      }
    },
    [kommunerIdOgNummer, kontekstType, utkast],
  );

  const [formState, setFormState] = useState<TilhorighetForm>(getTilhorighetData(kontekstEgenskaper));
  const setValue = (tilhorighet: Tilhorighet, value: string | undefined) => {
    const newState = { ...formState };
    newState[kontekstType][tilhorighet] = value;
    setFormState(newState);
  };

  const isDirty = useMemo(() => {
    const initialData = getTilhorighetData(kontekstEgenskaper);

    const grunnkretsDirty =
      initialData[KontekstType.GRUNNKRETS][Tilhorighet.A] !== formState[KontekstType.GRUNNKRETS][Tilhorighet.A] ||
      initialData[KontekstType.GRUNNKRETS][Tilhorighet.B] !== formState[KontekstType.GRUNNKRETS][Tilhorighet.B];
    const stemmekretsDirty =
      initialData[KontekstType.STEMMEKRETS][Tilhorighet.A] !== formState[KontekstType.STEMMEKRETS][Tilhorighet.A] ||
      initialData[KontekstType.STEMMEKRETS][Tilhorighet.B] !== formState[KontekstType.STEMMEKRETS][Tilhorighet.B];

    return stemmekretsDirty || grunnkretsDirty;
  }, [formState, kontekstEgenskaper]);

  const resetTilhorighet = useCallback(() => {
    setFormState(getTilhorighetData(kontekstEgenskaper));
  }, [kontekstEgenskaper]);

  const updateDraftFromFeature = () => {
    if (tilhorighetOptions) {
      const oppdaterteKontekstEgenskaper = getUpdatedKontekstEgenskaper(
        kontekstType,
        formState[kontekstType],
        tilhorighetOptions,
        kontekstEgenskaper,
      );
      addKontekstEntryFromFeature(feature as Feature<LineString>, oppdaterteKontekstEgenskaper, addHistoryEntry);
    }
  };

  return {
    setTilhorighetOptions,
    tilhorighetOptions,
    formState,
    setValue,
    isDirty,
    resetTilhorighet,
    updateDraftFromFeature,
    kommunerId,
    kontekstType,
  };
};
