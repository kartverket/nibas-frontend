import { Feature } from "ol";
import { SubmitHandler, useForm } from "react-hook-form";
import { FeatureProperties, Metadata } from "types/api";
import { addFeaturePropertiesEntryFromFeature } from "../GrenseinformasjonPanel/utils";
import { getMetadataDiscriminatorFromType } from "utils/grenser";
import { formatISO, startOfDay } from "date-fns";
import { LineString } from "ol/geom";
import { useHistory } from "contexts/HistoryContext";

export type GrenseinformasjonFormProps = {
  grenseType: string;
  datafangstDato: Date | undefined;
  maalemetode: string;
  noeyaktighet: number;
  opphav: string;
  informasjon: string;
};

const getDefaultValuesFromFeature = (feature: Feature) => {
  const featureProperties = feature.getProperties() as FeatureProperties;
  const metadata = featureProperties.metadata as Metadata;

  return {
    grenseType: featureProperties.type,
    datafangstDato: metadata.common?.datafangstdato ? new Date(metadata.common?.datafangstdato) : undefined,
    informasjon: metadata.common?.informasjon,
    maalemetode: metadata.commonGrense?.posisjonskvalitet?.maalemetode.id,
    noeyaktighet: metadata.commonGrense?.posisjonskvalitet?.noeyaktighet,
    opphav: metadata.common?.opphav,
  };
};

export const useGrenseinformasjonForm = (feature: Feature) => {
  const { register, handleSubmit, reset, getValues, control, formState } = useForm<GrenseinformasjonFormProps>({
    defaultValues: getDefaultValuesFromFeature(feature),
  });

  const { addHistoryEntry } = useHistory();

  const featureProperties = feature.getProperties() as FeatureProperties;
  const metadata = featureProperties.metadata as Metadata;

  const onSubmit: SubmitHandler<GrenseinformasjonFormProps> = (data) => {
    // DirtyFields blir satt riktig ved første submit, men isDirty blir ikke det, skjønner ikke hvorfor?
    if (Object.values(formState.dirtyFields).length > 0) {
      const metadataDiscriminator = getMetadataDiscriminatorFromType(data.grenseType);
      const commonMetadata = metadata.common;

      if (!metadataDiscriminator || !commonMetadata) return; // errorhåndtering på noe vis her

      // Vi trenger sårt MetadataRequest/MetadataUpdate her. Merker det er veldig knotete å sende inn en request på metadata for felter som backenden *egentlig*
      // ikke trenger blir likevel satt som påkrevd fra klienten. Må gjøre unødvendig spreading på common og sette en fallback på maalemetode.href på grunn av dette
      const newMetadata: Metadata = {
        ...metadata,
        common: {
          ...commonMetadata,
          datafangstdato: data.datafangstDato
            ? formatISO(startOfDay(data.datafangstDato))
            : metadata.common?.datafangstdato,
          informasjon: data.informasjon,
          opphav: data.opphav,
        },
        commonGrense: {
          posisjonskvalitet: {
            maalemetode: {
              id: data.maalemetode,
              href: metadata.commonGrense?.posisjonskvalitet?.maalemetode.href ?? "",
            },
            noeyaktighet: data.noeyaktighet,
          },
        },
        discriminator: metadataDiscriminator,
        dokumentasjonsreferanser: metadata.dokumentasjonsreferanser,
      };

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
    formState,
    control,
    getDefaultValues: getDefaultValuesFromFeature,
    onSubmit,
  };
};
