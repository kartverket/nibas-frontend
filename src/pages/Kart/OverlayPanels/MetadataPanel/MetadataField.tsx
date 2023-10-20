import MetadataRow from "./MetadataRow";
import { useMetadataField } from "../hooks/useMetadataField";
import { Geometry } from "ol/geom";
import { Feature } from "ol";
import { FeatureProperties, Metadata } from "types/api";
import React, { useEffect } from "react";
import useIsMetadataDisabled from "../hooks/useIsMetadataDisabled";
import { Inputs } from "./MetadataGenerelt";
import { UseFormRegisterReturn } from "react-hook-form";

type Props = {
  feature: Feature<Geometry>;
  fieldKey: keyof Inputs;
  fieldLabel: string;
  valueLabelFormatter?: (fieldLabel: string) => string | null;
  disabledByFeatureLock?: boolean;
  renderItem: (register: UseFormRegisterReturn<"metadata">) => React.ReactNode;
};

export const MetadataField = ({
  feature,
  fieldKey,
  fieldLabel,
  valueLabelFormatter,
  disabledByFeatureLock,
  renderItem,
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
      valueLabel={(() => {
        return valueLabelFormatter
          ? valueLabelFormatter(getValues().metadata) ?? "Ukjent"
          : getValues().metadata;
      })()}
      onMetadataSubmit={onSubmit}
      isDisabled={metadataIsDisabled || disabledByFeatureLock}
      isDirty={isDirty}
      reset={reset}
    >
      {renderItem(register("metadata"))}
    </MetadataRow>
  );
};
