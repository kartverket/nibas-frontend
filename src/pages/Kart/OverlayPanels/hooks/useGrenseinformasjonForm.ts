import { Feature } from "ol";
import { useForm } from "react-hook-form";
import { FeatureProperties, Metadata } from "types/api";
import { TilhorighetForm, getTilhorighetData } from "./tilhorighetUtils";

export type GrenseinformasjonFormProps = {
  grenseType: string;
  datafangstDato: Date | undefined;
  maalemetode: string;
  noeyaktighet: number;
  opphav: string;
  informasjon: string;
  tilhorighet: TilhorighetForm;
};

const getDefaultValuesFromFeature = (feature: Feature) => {
  const featureProperties = feature.getProperties() as FeatureProperties;
  const metadata = featureProperties.metadata as Metadata;
  const kontekstEgenskaper = featureProperties.kontekstEgenskaper;

  return {
    grenseType: featureProperties.type,
    datafangstDato: metadata.common?.datafangstdato ? new Date(metadata.common?.datafangstdato) : undefined,
    informasjon: metadata.common?.informasjon,
    maalemetode: metadata.commonGrense?.posisjonskvalitet?.maalemetode.id,
    noeyaktighet: metadata.commonGrense?.posisjonskvalitet?.noeyaktighet,
    opphav: metadata.common?.opphav,
    tilhorighet: getTilhorighetData(kontekstEgenskaper),
  };
};

export const useGrenseinformasjonForm = (feature: Feature) => {
  const { register, handleSubmit, reset, getValues, control, formState } = useForm<GrenseinformasjonFormProps>({
    defaultValues: getDefaultValuesFromFeature(feature),
  });

  return {
    register,
    handleSubmit,
    reset,
    getValues,
    formState,
    control,
    getDefaultValues: getDefaultValuesFromFeature,
  };
};
