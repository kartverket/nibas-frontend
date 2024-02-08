import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";

import {
  KontekstType,
  TilhorighetForm,
  TilhorighetOptions,
  getKommunerIdFromKontekstEgenskaper,
  getTilhorighetData,
  getUpdatedKontekstEgenskaper,
} from "./tilhorighetUtils";
import { useHistory } from "contexts/HistoryContext";
import { Feature } from "ol";
import { LineString } from "ol/geom";
import { FeatureProperties } from "types/api";
import { addKontekstEntryFromFeature } from "../MetadataPanel/utils";
import { GrenseType } from "hooks/layers/types";
import { useOverlayPanel } from "contexts/OverlayPanelContext";
import { getIdFromEntity } from "utils/api";

const mapGrenseTypeTilKontekstType = (grenseType: GrenseType): KontekstType => {
  switch (grenseType) {
    case "Stemmekretsgrense":
      return KontekstType.STEMMEKRETS;
    default:
      return KontekstType.GRUNNKRETS;
  }
};

export const useTilhorighetForm = (feature: Feature) => {
  const { addHistoryEntry } = useHistory();

  const featureProperties = feature.getProperties() as FeatureProperties;
  const kontekstEgenskaper = featureProperties.kontekstEgenskaper;
  const kontekstType =
    kontekstEgenskaper.map((k) => k.type as KontekstType)[0] ??
    mapGrenseTypeTilKontekstType(featureProperties.type as GrenseType);
  const { flatedata } = useOverlayPanel();
  const kommunerId =
    getKommunerIdFromKontekstEgenskaper(kontekstEgenskaper) ?? (flatedata ? [getIdFromEntity(flatedata!)] : []);
  const [tilhorighetOptions, setTilhorighetOptions] = useState<TilhorighetOptions>();

  const {
    register,
    getValues,
    formState: { isDirty },
    reset,
  } = useForm<TilhorighetForm>({
    defaultValues: getTilhorighetData(kontekstEgenskaper),
  });

  const resetTilhorighet = useCallback(() => {
    reset(
      kontekstEgenskaper.length === 2 ? getTilhorighetData(kontekstEgenskaper) : { GRUNNKRETS: {}, STEMMEKRETS: {} },
    );
  }, [kontekstEgenskaper, reset]);

  const updateDraftFromFeature = () => {
    if (kontekstType && tilhorighetOptions) {
      const oppdaterteKontekstEgenskaper = getUpdatedKontekstEgenskaper(getValues(kontekstType), tilhorighetOptions);
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
