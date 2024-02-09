import { Feature } from "ol";
import { ObjectEvent } from "ol/Object";
import { LineString } from "ol/geom";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { FeatureProperties } from "types/api";
import { addPropertyEntryFromFeature } from "../MetadataPanel/utils";
import { useHistory } from "contexts/HistoryContext";
import { Inputs } from "../MetadataPanel/MetadataGenerelt";

type PropertyField = {
  property: string;
};

const getUpdatedProperties = (data: PropertyField, oldProperties: FeatureProperties, field: keyof Inputs) => {
  const newProperties = {
    ...(oldProperties ?? {}),
    type: field === "grenseType" ? data.property : oldProperties.type,
  } as FeatureProperties;
  return newProperties;
};

const getFieldFromProperties = (properties: FeatureProperties, field: keyof Inputs) => {
  let value;
  switch (field) {
    case "grenseType":
      value = properties.type;
      break;
  }
  return { property: value?.toString() };
};

export const usePropertyField = (field: keyof Inputs, properties: FeatureProperties, feature: Feature) => {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    getValues,
    formState: { isDirty },
  } = useForm<PropertyField>({
    defaultValues: getFieldFromProperties(properties, field),
  });
  const { addHistoryEntry } = useHistory();

  useEffect(() => {
    const updateFormOnPropertyChange = (e: ObjectEvent) => {
      const newProperties = getFieldFromProperties(
        (e.target as Feature<LineString>).getProperties() as FeatureProperties,
        field,
      );
      setValue("property", newProperties.property ?? "");
    };

    feature.on("propertychange", updateFormOnPropertyChange);

    return () => {
      feature.un("propertychange", updateFormOnPropertyChange);
    };
  }, [feature, setValue, field]);

  const updateDraftFromFeature = () => {
    addPropertyEntryFromFeature(
      feature as Feature<LineString>,
      addHistoryEntry,
      getUpdatedProperties(getValues(), feature.getProperties() as FeatureProperties, field),
    );
  };

  return {
    register,
    handleSubmit,
    reset,
    getFieldFromProperties,
    updateDraftFromFeature,
    getValues,
    isDirty,
  };
};
