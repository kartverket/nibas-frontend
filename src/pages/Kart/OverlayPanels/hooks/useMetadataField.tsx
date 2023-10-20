import { Feature } from "ol";
import { ObjectEvent } from "ol/Object";
import { LineString } from "ol/geom";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Metadata } from "types/api";
import { addMetadataEntryFromFeature } from "../MetadataPanel/utils";
import { useHistory } from "contexts/HistoryContext";
import { Inputs } from "../MetadataPanel/MetadataGenerelt";

export type MetadataField = {
  metadata: string;
};

const getUpdatedMetadata = (
  data: MetadataField,
  oldMetadata: Metadata,
  field: keyof Inputs,
) => {
  const newMetadata = {
    ...(oldMetadata ?? {}),
    common: {
      ...(oldMetadata.common ?? {}),
      informasjon:
        field === "informasjon"
          ? data.metadata
          : oldMetadata.common?.informasjon,
      datafangstdato:
        field === "datafangstdato"
          ? data.metadata
          : oldMetadata.common?.datafangstdato,
      opphav: field === "opphav" ? data.metadata : oldMetadata.common?.opphav,
      gyldigFra:
        field === "gyldigFra" ? data.metadata : oldMetadata.common?.gyldigFra,
      gyldigTil:
        field === "gyldigTil" ? data.metadata : oldMetadata.common?.gyldigTil,
    },
    commonGrense: {
      ...(oldMetadata.commonGrense ?? {}),
      posisjonskvalitet: {
        ...(oldMetadata?.commonGrense?.posisjonskvalitet ?? {}),
        maalemetode: {
          id:
            field === "maalemetode"
              ? data.metadata
              : oldMetadata.commonGrense?.posisjonskvalitet?.maalemetode.id,
          href: "",
        },
        noeyaktighet:
          field === "noeyaktighet"
            ? data.metadata
            : oldMetadata.commonGrense?.posisjonskvalitet?.noeyaktighet,
      },
    },
  } as Metadata;
  return newMetadata;
};

const getFieldFromMetadata = (metadata: Metadata, field: keyof Inputs) => {
  let value;
  switch (field) {
    case "informasjon":
      value = metadata?.common?.informasjon;
      break;
    case "grenseType":
      value = metadata?.discriminator;
      break;
    case "datafangstdato":
      value = metadata.common?.datafangstdato?.split("T")[0];
      break;
    case "noeyaktighet":
      value = metadata?.commonGrense?.posisjonskvalitet?.noeyaktighet;
      break;
    case "opphav":
      value = metadata?.common?.opphav;
      break;
    case "gyldigFra":
      value = metadata?.common?.gyldigFra;
      break;
    case "gyldigTil":
      value = metadata?.common?.gyldigTil;
      break;
    case "maalemetode":
      value = metadata.commonGrense?.posisjonskvalitet?.maalemetode.id;
      break;
  }

  return { metadata: value?.toString() };
};

export const useMetadataField = (
  field: keyof Inputs,
  metadata: Metadata,
  feature: Feature,
) => {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    getValues,
    formState: { isDirty },
  } = useForm<MetadataField>({
    defaultValues: getFieldFromMetadata(metadata, field),
  });
  const { addHistoryEntry } = useHistory();

  useEffect(() => {
    const updateFormOnPropertyChange = (e: ObjectEvent) => {
      const newMetadata = getFieldFromMetadata(
        (e.target as Feature<LineString>).getProperties().metadata as Metadata,
        field,
      );
      setValue("metadata", newMetadata.metadata ?? "");
    };

    feature.on("propertychange", updateFormOnPropertyChange);

    return () => {
      feature.un("propertychange", updateFormOnPropertyChange);
    };
  }, [feature, setValue, field]);

  const updateDraftFromFeature = () => {
    addMetadataEntryFromFeature(
      feature as Feature<LineString>,
      addHistoryEntry,
      getUpdatedMetadata(
        getValues(),
        feature.getProperties().metadata as Metadata,
        field,
      ),
    );
  };

  return {
    register,
    handleSubmit,
    reset,
    setValue,
    getFieldFromMetadata,
    updateDraftFromFeature,
    getValues,
    isDirty,
  };
};
