import { useHistory } from "contexts/HistoryContext/HistoryContext";
import { formatISO, startOfDay } from "date-fns";
import { Feature } from "ol";
import { LineString } from "ol/geom";
import { SubmitHandler, useForm } from "react-hook-form";
import { FeatureProperties, Metadata } from "types/api";
import { getMetadataDiscriminatorFromType } from "utils/grenser";
import { getGrensetypeFromString } from "utils/type-utils";
import { addFeaturePropertiesEntryFromFeature } from "../GrenseinformasjonPanel/grenseinformasjon-utils";
import { withUpdatedMetadataCommonFields } from "utils/features";

type GrenseinformasjonFormProps = {
  grenseType: string;
  datafangstDato: Date | undefined;
  maalemetode: string | undefined;
  noeyaktighet: number | undefined;
  usikkerAvgrensning: boolean | undefined;
  opphav: string | undefined;
  informasjon: string | undefined;
};

const getDefaultValuesFromFeature = (feature: Feature): GrenseinformasjonFormProps => {
  const featureProperties = feature.getProperties() as FeatureProperties;
  const metadata = featureProperties.metadata as Metadata;

  const datafangstDato = new Date(metadata.common?.datafangstdato ?? "");

  return {
    grenseType: featureProperties.type,
    datafangstDato: isNaN(datafangstDato.valueOf()) ? undefined : datafangstDato,
    informasjon: metadata.common?.informasjon,
    maalemetode: metadata.commonGrense?.posisjonskvalitet?.maalemetode.id,
    noeyaktighet: metadata.commonGrense?.posisjonskvalitet?.noeyaktighet,
    usikkerAvgrensning: metadata.commonGrense?.posisjonskvalitet?.usikkerAvgrensning,
    opphav: metadata.common?.opphav,
  };
};

export const useGrenseinformasjonForm = (feature: Feature) => {
  const { register, handleSubmit, reset, getValues, setValue, control, formState } =
    useForm<GrenseinformasjonFormProps>({
      defaultValues: getDefaultValuesFromFeature(feature),
      mode: "onChange",
    });

  const { addHistoryEntry } = useHistory();

  // formState.dirtyFields blir satt riktig ved første submit, men formState.isDirty blir ikke det, skjønner ikke hvorfor?
  const isDirty = Object.values(formState.dirtyFields).length > 0;

  const onSubmit: SubmitHandler<GrenseinformasjonFormProps> = (data) => {
    if (Object.values(formState.dirtyFields).length > 0) {
      const grensetype = getGrensetypeFromString(data.grenseType);
      if (grensetype == null) {
        return;
      }
      const metadataDiscriminator = getMetadataDiscriminatorFromType(grensetype);
      const featureProperties = feature.getProperties() as FeatureProperties;
      const metadata = featureProperties.metadata as Metadata;
      const commonMetadata = metadata.common;
      if (metadataDiscriminator == null || commonMetadata == null) {
        return;
      } // errorhåndtering på noe vis her

      const newMetadata = withUpdatedMetadataCommonFields(
        metadata,
        metadataDiscriminator,
        {
          ...commonMetadata,
          datafangstdato: data.datafangstDato
            ? formatISO(startOfDay(data.datafangstDato))
            : metadata.common?.datafangstdato,
          informasjon: data.informasjon,
          opphav: data.opphav,
        },
        {
          posisjonskvalitet: {
            maalemetode: {
              id: data.maalemetode,
              href: metadata.commonGrense?.posisjonskvalitet?.maalemetode.href ?? "",
            },
            noeyaktighet: data.noeyaktighet,
            usikkerAvgrensning:
              data.usikkerAvgrensning ?? metadata.commonGrense?.posisjonskvalitet?.usikkerAvgrensning ?? false,
          },
        },
      );

      const newProperties: FeatureProperties = {
        ...featureProperties,
        type: data.grenseType,
        metadata: newMetadata,
      };

      addFeaturePropertiesEntryFromFeature(feature as Feature<LineString>, addHistoryEntry, newProperties);

      reset(getDefaultValuesFromFeature(feature));
    }
  };

  return {
    register,
    handleSubmit,
    reset,
    getValues,
    setValue,
    formState,
    control,
    getDefaultValues: getDefaultValuesFromFeature,
    onSubmit,
    isDirty,
  };
};
