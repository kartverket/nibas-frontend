import GrenseinformasjonRow from "./GrenseinformasjonRow";
import { useGrenseinformasjonField } from "../hooks/useGrenseinformasjonField";
import { Geometry } from "ol/geom";
import { Feature } from "ol";
import { FeatureProperties, Metadata } from "types/api";
import React, { useEffect } from "react";
import useIsGrenseinformasjonPanelDisabled from "../hooks/useIsGrenseInformasjonPanelDisabled";
import { Inputs } from "./GrenseinformasjonFieldList";
import { UseFormRegisterReturn } from "react-hook-form";

type Props = {
  feature: Feature<Geometry>;
  fieldKey: keyof Inputs;
  fieldLabel: string;
  tooltipLabel: string;
  valueLabelFormatter?: (fieldLabel: string) => string | null;
  isDisabled?: boolean;
  isUneditable?: boolean;
  renderItem: (register: UseFormRegisterReturn<"value">) => React.ReactNode;
};

export const GrenseinformasjonField = ({
  feature,
  fieldKey,
  fieldLabel,
  tooltipLabel,
  valueLabelFormatter,
  isDisabled,
  isUneditable,
  renderItem,
}: Props) => {
  const properties = feature.getProperties() as FeatureProperties;
  const metadata = properties.metadata as Metadata;
  const { register, isDirty, updateDraftFromFeature, reset, getValues, getFieldFromFeature } =
    useGrenseinformasjonField(fieldKey, feature);

  // Still tilbake til default-verdi dersom man bytter valgt feature
  useEffect(() => {
    reset(getFieldFromFeature(feature, fieldKey));
  }, [fieldKey, getFieldFromFeature, feature, reset]);

  const onSubmit = () => {
    updateDraftFromFeature();
  };
  const isGrenseinformasjonPanelDisabled = useIsGrenseinformasjonPanelDisabled(feature, properties);

  const formattedLabel = valueLabelFormatter ? valueLabelFormatter(getValues().value) ?? "Ukjent" : getValues().value;

  return (
    <GrenseinformasjonRow
      feature={feature}
      name={fieldLabel}
      tooltipLabel={tooltipLabel}
      valueLabel={formattedLabel}
      onMetadataSubmit={onSubmit}
      isDisabled={isGrenseinformasjonPanelDisabled || isDisabled || metadata?.common?.gyldigTil != null}
      isDirty={isDirty}
      reset={reset}
      isUneditable={isUneditable}
    >
      {renderItem(register("value"))}
    </GrenseinformasjonRow>
  );
};
