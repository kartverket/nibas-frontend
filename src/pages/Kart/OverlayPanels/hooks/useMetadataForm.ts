import { useEffect } from "react";
import { Feature } from "ol";
import Geometry from "ol/geom/Geometry";
import LineString from "ol/geom/LineString";
import { ObjectEvent } from "ol/Object";
import { useForm } from "react-hook-form";
import useAsyncKodeliste from "./useAsyncKodeliste";
import { addMetadataEntryFromFeature } from "../MetadataPanel/utils";
import { useHistory } from "contexts/HistoryContext";
import { Metadata } from "types/api";

export type Inputs = {
  grenseType: string;
  maalemetode: string;
  datafangstdato: string;
  noeyaktighet: number;
  informasjon: string;
  opphav: string;
  gyldigFra: string;
  gyldigTil: string;
};

const getUpdatedMetadata = (data: Inputs, oldMetadata: Metadata) => {
  const newMetadata = {
    ...(oldMetadata ?? {}),
    common: {
      ...(oldMetadata.common ?? {}),
      informasjon: data.informasjon,
      datafangstdato: data.datafangstdato,
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
  } as Metadata;
  return newMetadata;
};

const getFormFromApiMetadata = (metadata: Metadata) => ({
  informasjon: metadata?.common?.informasjon,
  grenseType: metadata?.discriminator,
  datafangstdato: metadata.common?.datafangstdato?.split("T")[0],
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
    resetField,
    reset,
    formState: { dirtyFields },
  } = useForm<Inputs>({
    defaultValues: getFormFromApiMetadata(metadata),
  });

  const maalemetodeKoder = useAsyncKodeliste({
    property: "maalemetode",
    setValue,
    kodelisteUrl: "/v1/kodeliste/maalemetode-koder",
    initialItemId: metadata.commonGrense?.posisjonskvalitet?.maalemetode.id,
  });

  const { addHistoryEntry } = useHistory();

  useEffect(() => {
    const updateFormOnPropertyChange = (e: ObjectEvent) => {
      const newMetadata = (e.target as Feature<LineString>).getProperties()
        .metadata as Metadata;

      setValue("informasjon", newMetadata?.common?.informasjon ?? "");
      setValue("grenseType", newMetadata?.discriminator ?? "");
      setValue("datafangstdato", newMetadata?.common?.datafangstdato ?? "");
      setValue(
        "noeyaktighet",
        newMetadata?.commonGrense?.posisjonskvalitet?.noeyaktighet ?? 0,
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
      addHistoryEntry,
      getUpdatedMetadata(
        getValues(),
        feature.getProperties().metadata as Metadata,
      ),
    );
  };

  return {
    register,
    handleSubmit,
    maalemetodeKoder,
    getValues,
    updateDraftFromFeature,
    dirtyFields,
    resetField,
    reset,
    getFormFromApiMetadata,
  };
};

export default useMetadataForm;
