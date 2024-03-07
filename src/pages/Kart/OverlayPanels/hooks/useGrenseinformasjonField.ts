import { Feature } from "ol";
import { ObjectEvent } from "ol/Object";
import { LineString } from "ol/geom";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { FeatureProperties, Metadata } from "types/api";
import { addFeaturePropertiesEntryFromFeature } from "../GrenseinformasjonPanel/grenseinformasjon-utils";
import { useHistory } from "contexts/HistoryContext/HistoryContext";
import { Inputs } from "../GrenseinformasjonPanel/GrenseinformasjonFieldList";
import { formatISO, startOfDay } from "date-fns";
import { getMetadataDiscriminatorFromType } from "utils/grenser";

type GrenseinformasjonField = {
  value: string;
};

const getUpdatedFeatureProperties = (
  data: GrenseinformasjonField,
  oldProperties: FeatureProperties,
  field: keyof Inputs,
) => {
  const oldMetadata = oldProperties.metadata as Metadata;
  const newMetadata = {
    ...(oldMetadata ?? {}),
    discriminator: field === "grenseType" ? getMetadataDiscriminatorFromType(data.value) : oldMetadata?.discriminator,
    common: {
      ...(oldMetadata?.common ?? {}),
      informasjon: field === "informasjon" ? data.value : oldMetadata?.common?.informasjon,
      datafangstdato:
        field === "datafangstdato" ? formatISO(startOfDay(new Date(data.value))) : oldMetadata?.common?.datafangstdato,
      opphav: field === "opphav" ? data.value : oldMetadata?.common?.opphav,
      gyldigFra: field === "gyldigFra" ? data.value : oldMetadata?.common?.gyldigFra,
      gyldigTil: field === "gyldigTil" ? data.value : oldMetadata?.common?.gyldigTil,
    },
    commonGrense: {
      ...(oldMetadata?.commonGrense ?? {}),
      posisjonskvalitet: {
        ...(oldMetadata?.commonGrense?.posisjonskvalitet ?? {}),
        maalemetode: {
          id: field === "maalemetode" ? data.value : oldMetadata?.commonGrense?.posisjonskvalitet?.maalemetode.id,
          href: "",
        },
        noeyaktighet:
          field === "noeyaktighet" ? data.value : oldMetadata?.commonGrense?.posisjonskvalitet?.noeyaktighet,
      },
    },
  } as Metadata;

  const newProperties: FeatureProperties = {
    ...(oldProperties ?? {}),
    type: field === "grenseType" ? data.value : oldProperties.type,
    metadata: newMetadata,
    // Når vi bytter grensetype må vi fjerne kontekstegenskaper, da disse ikke stemmer overens mellom grensetyper
    kontekstEgenskaper: field === "grenseType" ? [] : oldProperties.kontekstEgenskaper,
  };

  return newProperties;
};

const getFieldFromFeature = (feature: Feature, field: keyof Inputs) => {
  let value;
  const properties = feature.getProperties() as FeatureProperties;
  const metadata = properties.metadata as Metadata;
  switch (field) {
    case "uuid":
      value = metadata?.common?.identifikasjon?.lokalid;
      break;
    case "informasjon":
      value = metadata?.common?.informasjon;
      break;
    case "grenseType":
      value = properties.type;
      break;
    case "datafangstdato":
      value = metadata?.common?.datafangstdato?.split("T")[0];
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
      value = metadata?.commonGrense?.posisjonskvalitet?.maalemetode?.id;
      break;
  }
  return { value: value?.toString() };
};

export const useGrenseinformasjonField = (field: keyof Inputs, feature: Feature) => {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    getValues,
    formState: { isDirty },
  } = useForm<GrenseinformasjonField>({
    defaultValues: getFieldFromFeature(feature, field),
  });
  const { addHistoryEntry } = useHistory();

  useEffect(() => {
    const updateFormOnPropertyChange = (e: ObjectEvent) => {
      const newGrenseinformasjon = getFieldFromFeature(e.target as Feature<LineString>, field);
      setValue("value", newGrenseinformasjon.value ?? "");
    };

    feature.on("propertychange", updateFormOnPropertyChange);

    return () => {
      feature.un("propertychange", updateFormOnPropertyChange);
    };
  }, [setValue, field, feature]);

  const updateDraftFromFeature = () => {
    addFeaturePropertiesEntryFromFeature(
      feature as Feature<LineString>,
      addHistoryEntry,
      getUpdatedFeatureProperties(getValues(), feature.getProperties() as FeatureProperties, field),
    );
  };

  return {
    register,
    handleSubmit,
    reset,
    getFieldFromFeature,
    updateDraftFromFeature,
    getValues,
    isDirty,
  };
};
