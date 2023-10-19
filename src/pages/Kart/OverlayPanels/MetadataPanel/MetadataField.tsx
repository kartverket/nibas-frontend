import MetadataRow from "./MetadataRow";
import { useMetadataField } from "../hooks/useMetadataField";
import { Geometry } from "ol/geom";
import { Feature } from "ol";
import { FeatureProperties, Metadata } from "types/api";
import React, { useEffect } from "react";
import useIsMetadataDisabled from "../hooks/useIsMetadataDisabled";
import { Inputs } from "./MetadataGenerelt";

type Props = {
  feature: Feature<Geometry>;
  fieldKey: keyof Inputs;
  fieldLabel: string;
  valueLabelFormatter?: (fieldLabel: string) => string | null;
  children: React.ReactNode;
  disabledByFeatureLock?: boolean;
};

export const MetadataField = ({
  feature,
  fieldKey,
  fieldLabel,
  valueLabelFormatter,
  children,
  disabledByFeatureLock,
}: Props) => {
  const properties = feature.getProperties() as FeatureProperties;
  const metadata = properties.metadata as Metadata;
  const {
    register,
    isDirty,
    updateDraftFromFeature,
    reset,
    getValues,
    getFieldFromMetadata,
  } = useMetadataField(fieldKey, metadata, feature);

  // Still tilbake til default-verdi dersom man bytter valgt feature
  useEffect(() => {
    reset(getFieldFromMetadata(metadata, fieldKey));
  }, [getFieldFromMetadata, metadata, reset, fieldKey]);

  const onSubmit = () => {
    updateDraftFromFeature();
  };
  const metadataIsDisabled = useIsMetadataDisabled(properties);

  return (
    <MetadataRow
      feature={feature}
      name={fieldLabel}
      value={
        valueLabelFormatter
          ? valueLabelFormatter(getValues().metadata) ?? "Ukjent"
          : getValues().metadata
      }
      onMetadataSubmit={onSubmit}
      isDisabled={metadataIsDisabled || disabledByFeatureLock}
      isDirty={isDirty}
      reset={reset}
    >
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, { ...register("metadata") });
        }
        return child;
      })}
    </MetadataRow>
  );
};
