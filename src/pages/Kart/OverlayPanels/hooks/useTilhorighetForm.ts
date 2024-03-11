import { useState } from "react";

import {
  CustomOption,
  KontekstType,
  TilhorighetOptions,
  getKommunerIdFromKontekstEgenskaper,
} from "./tilhorighetUtils";
import { Feature } from "ol";
import { FeatureProperties } from "types/api";
import { useOverlayPanel } from "contexts/OverlayPanelContext";
import { getIdFromEntity } from "utils/api";
import { EditingType, useEditAllGrenser } from "contexts/EditGrenserContext";

const getKontekstTypeFromEditingType = (editingType: EditingType | null): KontekstType | null => {
  if (!editingType) return null;

  switch (editingType) {
    case "stemmekrets":
      return KontekstType.STEMMEKRETS;
    case "grunnkrets":
      return KontekstType.GRUNNKRETS;
  }

  return null;
};

export const getDefaultTilhorighetData = () => ({
  GRUNNKRETS: { a: CustomOption.NOT_CHOSEN, b: CustomOption.NOT_CHOSEN },
  STEMMEKRETS: { a: CustomOption.NOT_CHOSEN, b: CustomOption.NOT_CHOSEN },
});

export const useTilhorighetForm = (feature: Feature) => {
  const { getCurrentlyEditingType } = useEditAllGrenser();

  const featureProperties = feature.getProperties() as FeatureProperties;
  const kontekstEgenskaper = featureProperties.kontekstEgenskaper;
  const kontekstType =
    kontekstEgenskaper.map((k) => k.type as KontekstType)[0] ??
    getKontekstTypeFromEditingType(getCurrentlyEditingType());
  const { flatedata } = useOverlayPanel();
  const kommunerId =
    getKommunerIdFromKontekstEgenskaper(
      kontekstEgenskaper.filter((k) => k.id?.lokalid.value !== CustomOption.NOT_CHOSEN),
    ) ?? (flatedata ? [getIdFromEntity(flatedata)] : []);
  const [tilhorighetOptions, setTilhorighetOptions] = useState<TilhorighetOptions>();

  return {
    setTilhorighetOptions,
    tilhorighetOptions,
    kommunerId,
    kontekstType,
  };
};
