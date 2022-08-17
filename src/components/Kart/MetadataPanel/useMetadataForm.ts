import { useAuthenticationFlow } from "@kartverket/frontend-aut-lib";
import { Feature } from "ol";
import Geometry from "ol/geom/Geometry";
import { useForm } from "react-hook-form";
import useAsyncKodeliste from "./useAsyncKodeliste";
import { updateGrenser } from "api/grenser";
import { Metadata } from "types/api";

type Inputs = {
  grenseType: string;
  maalemetode: string;
  noeyaktighet: number;
  informasjon: string;
  opphav: string;
  gyldigFra: string;
  gyldigTil: string;
};

const getUpdatedMetadata = (data: Inputs, oldMetadata: Metadata) =>
  ({
    ...(oldMetadata ?? {}),
    common: {
      ...(oldMetadata.common ?? {}),
      informasjon: data.informasjon,
      opphav: data.opphav,
      gyldigFra: data.gyldigFra,
      gyldigTil: data.gyldigTil,
    },
    commonGrense: {
      ...(oldMetadata.commonGrense ?? {}),
      posisjonskvalitet: {
        ...(oldMetadata?.commonGrense?.posisjonskvalitet ?? {}),
        maalemetode: {
          id: data.maalemetode,
          href: "",
        },
        noeyaktighet: data.noeyaktighet,
      },
    },
  } as Metadata);

const useMetadataForm = (metadata: Metadata, feature: Feature<Geometry>) => {
  const { register, handleSubmit, setValue } = useForm<Inputs>({
    defaultValues: {
      informasjon: metadata?.common?.informasjon,
      grenseType: metadata?.discriminator,
      noeyaktighet: metadata?.commonGrense?.posisjonskvalitet?.noeyaktighet,
      opphav: metadata?.common?.opphav,
      gyldigFra: metadata?.common?.gyldigFra,
      gyldigTil: metadata?.common?.gyldigTil,
    },
  });

  const { tokenHolderFunc } = useAuthenticationFlow();

  const maalemetodeKoder = useAsyncKodeliste({
    property: "maalemetode",
    setValue,
    kodelisteUrl: "/v1/kodeliste/maalemetode-koder",
    initialItemId: metadata.commonGrense?.posisjonskvalitet?.maalemetode.id,
  });

  const onSubmit = handleSubmit((data) => {
    const oldProperties = feature.getProperties();

    feature.setProperties({
      ...oldProperties,
      metadata: getUpdatedMetadata(data, oldProperties.metadata),
    });

    updateGrenser([feature], tokenHolderFunc()?.token);
  });

  return {
    register,
    onSubmit,
    maalemetodeKoder,
  };
};

export default useMetadataForm;
