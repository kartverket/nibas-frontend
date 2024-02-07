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

export const useTilhorighetForm = (feature: Feature) => {
  const { addHistoryEntry } = useHistory();

  const featureProperties = feature.getProperties() as FeatureProperties;
  const kontekstEgenskaper = featureProperties.kontekstEgenskaper;
  const kontekstType = kontekstEgenskaper.map((k) => k.type as KontekstType)[0];
  const kommunerId = getKommunerIdFromKontekstEgenskaper(kontekstEgenskaper);
  const [tilhorighetOptions, setTilhorighetOptions] = useState<TilhorighetOptions>();

  const {
    register,
    getValues,
    formState: { isDirty },
    reset,
  } = useForm<TilhorighetForm>({
    values: getTilhorighetData(kontekstEgenskaper),
  });

  const resetTilhorighet = useCallback(() => {
    if (tilhorighetOptions) {
      reset(getTilhorighetData(kontekstEgenskaper));
    }
  }, [kontekstEgenskaper, reset, tilhorighetOptions]);

  const updateDraftFromFeature = () => {
    if (kontekstType && kontekstEgenskaper && tilhorighetOptions) {
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
