import { useEffect } from "react";
import { useAuthenticationFlow } from "@kartverket/frontend-aut-lib";
import { Feature } from "ol";
import Geometry from "ol/geom/Geometry";
import { useForm } from "react-hook-form";
import { updateGrenser } from "api/grenser";
import useNibasApi from "hooks/useNibasApi";
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
  const { data: maalemetodeKoder } = useNibasApi(
    "/v1/kodeliste/maalemetode-koder"
  );

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

  // oppdater målemetode tekstfelt når kodene er hentet
  useEffect(() => {
    if (!maalemetodeKoder) return;

    const selectedMaalemetode = maalemetodeKoder.items.find(
      (kode) =>
        kode.id === metadata.commonGrense?.posisjonskvalitet?.maalemetode.id
    );

    if (!selectedMaalemetode) return;

    setValue("maalemetode", selectedMaalemetode.id);
  }, [
    maalemetodeKoder,
    setValue,
    metadata.commonGrense?.posisjonskvalitet?.maalemetode,
  ]);

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
    maalemetodeKoder: maalemetodeKoder?.items,
  };
};

export default useMetadataForm;
