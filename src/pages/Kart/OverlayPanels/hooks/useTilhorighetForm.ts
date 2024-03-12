import { useHistory } from "contexts/HistoryContext";
import { useOverlayPanel } from "contexts/OverlayPanelContext";
import { useUtkast } from "contexts/UtkastContext";
import { GrenseType } from "hooks/layers/types";
import { Feature } from "ol";
import { LineString } from "ol/geom";
import { useCallback, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { FeatureProperties, KontekstEgenskaper, KretsDelingEndringRequest, UtkastOperasjoner } from "types/api";
import { getIdFromEntity } from "utils/api";
import {
  CustomOption,
  KontekstType,
  Krets,
  Tilhorighet,
  TilhorighetForm,
  TilhorighetOptions,
  getKommunerIdFromKontekstEgenskaper,
  getTilhorighetData,
  getUpdatedKontekstEgenskaper,
} from "./tilhorighetUtils";
import { addKontekstEntryFromFeature } from "../GrenseinformasjonPanel/utils";

const mapGrenseTypeTilKontekstType = (grenseType: GrenseType): KontekstType => {
  switch (grenseType) {
    case "Stemmekretsgrense":
      return KontekstType.STEMMEKRETS;
    default:
      return KontekstType.GRUNNKRETS;
  }
};

const getKretserFromKretsDelingEndringer = (
  kommunerId: string[],
  kretsDelingEndringRequests: KretsDelingEndringRequest[],
): Krets[] => {
  return kretsDelingEndringRequests
    .filter((kretsDeling) => kommunerId.includes(kretsDeling.kommuneId.lokalid.value))
    .flatMap((kretsDeling) =>
      kretsDeling.nyeKretser.map((nyKrets) => ({
        id: {
          lokalid: { value: `NY_KRETS_${nyKrets.kretsNummer}_${kretsDeling.kommuneId.lokalid.value}` },
          gyldighetsdato: "",
        },
        kommuneId: kretsDeling.kommuneId,
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
    const notExistsNewKretsWithEqualKommuneAndKretsnummer = !currentOperasjoner?.kretsDelingEndringer
      .filter((deling) => deling.kommuneId.lokalid.value === kontekstEgenskaper.kommuneId?.lokalid.value)
      .find((deling) => deling.nyeKretser.find((krets) => krets.kretsNummer === kontekstEgenskaper.kretsNummer));
    if (notExistsNewKretsWithEqualKommuneAndKretsnummer) {
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

export const useTilhorighetForm = (feature: Feature) => {
  const { addHistoryEntry } = useHistory();
  const { utkast } = useUtkast();

  const featureProperties = feature.getProperties() as FeatureProperties;
  const kontekstEgenskaper = useMemo(
    () => featureProperties.kontekstEgenskaper.map((ke) => getIdForKontekstEgenskaper(ke, utkast?.operasjoner)), // kontekster som peker til nye kretser i utkastet har undefined som id. Vi må gi disse en unik id også som kan brukes i formet.
    [featureProperties.kontekstEgenskaper, utkast],
  );
  const kontekstType =
    kontekstEgenskaper.map((k) => k.type as KontekstType)[0] ??
    mapGrenseTypeTilKontekstType(featureProperties.type as GrenseType);
  const { flatedata } = useOverlayPanel();

  const kommunerId = useMemo(
    () =>
      getKommunerIdFromKontekstEgenskaper(
        kontekstEgenskaper.filter((k) => k.id?.lokalid.value !== CustomOption.NOT_CHOSEN),
      ) ?? (flatedata ? [getIdFromEntity(flatedata)] : []),
    [flatedata, kontekstEgenskaper],
  );

  const [tilhorighetOptions, setTilhorighetValg] = useState<TilhorighetOptions>();

  // wrapper for setter av tilhørighetoptions. Spreader inn nye kretser i hver dropdown.
  const setTilhorighetOptions = useCallback(
    (commonOptions: TilhorighetOptions | undefined) => {
      if (!utkast || !commonOptions) return;
      const tilhorighetOptionsFromUtkast = getKretserFromKretsDelingEndringer(
        kommunerId,
        utkast.operasjoner.kretsDelingEndringer.filter((deling) => deling.flatetype === kontekstType),
      );
      setTilhorighetValg({
        [Tilhorighet.A]: [...commonOptions[Tilhorighet.A], ...tilhorighetOptionsFromUtkast],
        [Tilhorighet.B]: [...commonOptions[Tilhorighet.B], ...tilhorighetOptionsFromUtkast],
      });
    },
    [kommunerId, kontekstType, utkast],
  );

  const {
    register,
    getValues,
    formState: { isDirty },
    reset,
  } = useForm<TilhorighetForm>({
    defaultValues: getTilhorighetData(kontekstEgenskaper),
  });

  const resetTilhorighet = useCallback(() => {
    reset(getTilhorighetData(kontekstEgenskaper));
  }, [kontekstEgenskaper, reset]);

  const updateDraftFromFeature = () => {
    if (kontekstType && tilhorighetOptions) {
      const oppdaterteKontekstEgenskaper = getUpdatedKontekstEgenskaper(
        kontekstType,
        getValues(kontekstType),
        tilhorighetOptions,
      );
      addKontekstEntryFromFeature(feature as Feature<LineString>, oppdaterteKontekstEgenskaper, addHistoryEntry);
    }
  };

  return {
    setTilhorighetOptions,
    tilhorighetOptions,
    register,
    getValues,
    isDirty,
    resetTilhorighet,
    updateDraftFromFeature,
    kommunerId,
    kontekstType,
  };
};
