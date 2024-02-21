import { useHistory } from "contexts/HistoryContext";
import { useOverlayPanel } from "contexts/OverlayPanelContext";
import { useUtkast } from "contexts/UtkastContext";
import { GrenseType } from "hooks/layers/types";
import { Feature } from "ol";
import { LineString } from "ol/geom";
import { useCallback, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { FeatureProperties, KontekstEgenskaper, KretsDelingEndringRequest } from "types/api";
import { getIdFromEntity } from "utils/api";
import { addKontekstEntryFromFeature } from "../MetadataPanel/utils";
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
      kretsDeling.nyeKretser.map(
        (nyKrets) =>
          ({
            id: {
              lokalid: { value: `NY_KRETS_${nyKrets.kretsNummer}_${kretsDeling.kommuneId.lokalid.value}` },
              gyldighetsdato: "",
            },
            kommuneId: kretsDeling.kommuneId,
            version: kretsDeling.opprinneligKrets.version,
            type: kretsDeling.flatetype,
            navn: nyKrets.kretsNavn,
            nummer: nyKrets.kretsNummer,
          }) as Krets,
      ),
    );
};

const getTempIdForNyKretsKontekstEgenskaper = (kontekstEgenskaper: KontekstEgenskaper): KontekstEgenskaper => {
  if (kontekstEgenskaper.id) return kontekstEgenskaper;
  return {
    ...kontekstEgenskaper,
    id: {
      lokalid: { value: `NY_KRETS_${kontekstEgenskaper.kretsNummer}_${kontekstEgenskaper.kommuneId?.lokalid.value}` },
      gyldighetsdato: "",
    },
  };
};

const getDefaultTilhorighetData = () => ({
  GRUNNKRETS: { a: CustomOption.NOT_CHOSEN, b: CustomOption.NOT_CHOSEN },
  STEMMEKRETS: { a: CustomOption.NOT_CHOSEN, b: CustomOption.NOT_CHOSEN },
});

export const useTilhorighetForm = (feature: Feature) => {
  const { addHistoryEntry } = useHistory();
  const { utkast } = useUtkast();

  const featureProperties = feature.getProperties() as FeatureProperties;
  const kontekstEgenskaper = useMemo(
    () => featureProperties.kontekstEgenskaper.map((ke) => getTempIdForNyKretsKontekstEgenskaper(ke)), // kontekster som peker til nye kretser har undefined som id
    [featureProperties.kontekstEgenskaper],
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

  const setTilhorighetOptions = useCallback(
    (commonOptions: TilhorighetOptions | undefined) => {
      if (!utkast || !commonOptions) return;
      const tilhorighetOptionsFromUtkast = getKretserFromKretsDelingEndringer(
        kommunerId,
        utkast.operasjoner.kretsDelingEndringer,
      );
      setTilhorighetValg({
        [Tilhorighet.A]: [...commonOptions[Tilhorighet.A], ...tilhorighetOptionsFromUtkast],
        [Tilhorighet.B]: [...commonOptions[Tilhorighet.B], ...tilhorighetOptionsFromUtkast],
      });
    },
    [kommunerId, utkast],
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
    reset(kontekstEgenskaper.length === 2 ? getTilhorighetData(kontekstEgenskaper) : getDefaultTilhorighetData());
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

  console.log(kontekstEgenskaper);

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
