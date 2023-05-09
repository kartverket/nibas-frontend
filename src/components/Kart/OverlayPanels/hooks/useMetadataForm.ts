import { useEffect } from "react";
import { Feature } from "ol";
import Geometry from "ol/geom/Geometry";
import LineString from "ol/geom/LineString";
import { ObjectEvent } from "ol/Object";
import { useForm } from "react-hook-form";
import useAsyncKodeliste from "./useAsyncKodeliste";
import { addMetadataEntryFromFeature } from "../utils";
import { useToolbarSaving } from "contexts/ToolbarContext";
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

const getFormFromApiMetadata = (metadata: Metadata) => ({
  informasjon: metadata?.common?.informasjon,
  grenseType: metadata?.discriminator,
  noeyaktighet: metadata?.commonGrense?.posisjonskvalitet?.noeyaktighet,
  opphav: metadata?.common?.opphav,
  gyldigFra: metadata?.common?.gyldigFra,
  gyldigTil: metadata?.common?.gyldigTil,
});

const useMetadataForm = (metadata: Metadata, feature: Feature<Geometry>) => {
  const {
    register,
    setValue,
    getValues,
    handleSubmit,
    reset,
    formState: { isDirty },
  } = useForm<Inputs>({
    defaultValues: getFormFromApiMetadata(metadata),
  });

  const maalemetodeKoder = useAsyncKodeliste({
    property: "maalemetode",
    setValue,
    kodelisteUrl: "/v1/kodeliste/maalemetode-koder",
    initialItemId: metadata.commonGrense?.posisjonskvalitet?.maalemetode.id,
  });

  const { addEntry } = useToolbarSaving();

  useEffect(() => {
    const updateFormOnPropertyChange = (e: ObjectEvent) => {
      const newMetadata = (e.target as Feature<LineString>).getProperties()
        .metadata as Metadata;

      setValue("informasjon", newMetadata?.common?.informasjon ?? "");
      setValue("grenseType", newMetadata?.discriminator ?? "");
      setValue(
        "noeyaktighet",
        newMetadata?.commonGrense?.posisjonskvalitet?.noeyaktighet ?? 0
      );
      setValue("opphav", newMetadata?.common?.opphav ?? "");
      setValue("gyldigFra", newMetadata?.common?.gyldigFra ?? "");
      setValue("gyldigTil", newMetadata?.common?.gyldigTil ?? "");
    };

    feature.on("propertychange", updateFormOnPropertyChange);

    return () => {
      feature.un("propertychange", updateFormOnPropertyChange);
    };
  }, [feature, setValue]);

  const updateDraftFromFeature = () => {
    addMetadataEntryFromFeature(
      feature as Feature<LineString>,
      addEntry,
      getUpdatedMetadata(
        getValues(),
        feature.getProperties().metadata as Metadata
      )
    );
  };

  return {
    register,
    handleSubmit,
    maalemetodeKoder,
    updateDraftFromFeature,
    isDirty,
    reset,
  };
};

export default useMetadataForm;
