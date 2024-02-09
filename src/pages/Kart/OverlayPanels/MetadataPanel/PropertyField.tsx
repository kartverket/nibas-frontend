import { Feature } from "ol";
import { Geometry } from "ol/geom";
import { FeatureProperties } from "types/api";
import { Select, Stack } from "@kvib/react";
import { GrenseType } from "hooks/layers/types";
import { useTilhorighet } from "../hooks/useTilhorighet";
import { useEffect } from "react";
import { EditingType } from "contexts/EditGrenserContext";
import MetadataRow from "./MetadataRow";
import { usePropertyField } from "../hooks/usePropertyField";
import Input from "components/Input";
import { Inputs } from "./MetadataGenerelt";

type PropertyFieldProps = {
  feature: Feature<Geometry>;
  fieldKey: keyof Inputs;
  isDisabled?: boolean;
};

export const PropertyField = ({ feature, isDisabled, fieldKey }: PropertyFieldProps) => {
  const properties = feature.getProperties() as FeatureProperties;

  const { getFieldFromProperties, getValues, handleSubmit, isDirty, register, reset, updateDraftFromFeature } =
    usePropertyField(fieldKey, feature.getProperties() as FeatureProperties, feature);

  // const getPossibleGrenseTypesFromEditingType = (editingType: EditingType | null): GrenseType[] => {
  //   if (editingType === "stemmekrets") {
  //     return ["Stemmekretsgrense", "Kommunegrense"];
  //   }
  //   if (editingType === "grunnkrets") {
  //     return ["Grunnkretsgrense", "Delområdegrense", "Kommunegrense"];
  //   }

  //   return [];
  // };

  // Still tilbake til default-verdi dersom man bytter valgt feature
  useEffect(() => {
    reset(getFieldFromProperties(properties, fieldKey));
  }, [reset, fieldKey, getFieldFromProperties, properties]);

  const onSubmit = () => {
    updateDraftFromFeature();
  };

  return (
    <MetadataRow
      feature={feature}
      name={propertyName}
      valueLabel={getValuesFormatted() ?? "Ikke definert"}
      onMetadataSubmit={() => updateDraftFromFeature()}
      isDirty={isDirty}
      reset={reset}
      tooltipLabel="Definerer hvilke inndelinger grensen har på hver sin side. Obs! Endring av dette feltet kan forårsake geometriendringer."
    >
      <Select {...register}>
        {getPossibleGrenseTypesFromEditingType(getCurrentlyEditingType()).map((type) => (
          <option key={type} value={type}>
            {type}
          </option>
        ))}
        {/* {GrenseTypeValues.map((type) => (
              <option key={type}>{type}</option>
            ))} */}
      </Select>
    </MetadataRow>
  );
};
