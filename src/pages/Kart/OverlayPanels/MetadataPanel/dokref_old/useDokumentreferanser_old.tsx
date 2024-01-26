import { MetadataEntry, useHistory } from "contexts/HistoryContext";
import { Feature } from "ol";
import { LineString } from "ol/geom";
import { useForm } from "react-hook-form";
import { Dokref, FeatureProperties, Metadata } from "types/api";
import { DokrefForm, Inputs } from "./MetadataReferanser";
import { useEffect } from "react";
import { ObjectEvent } from "ol/Object";

const mapFromApiToForm = (dokrefs: Dokref[] = []): DokrefForm[] => {
  return dokrefs.map((dokref) => ({
    apiId: dokref.id,
    fastsettingsdato: dokref.fastsettingsdato,
    fastsettingsmyndighet: dokref.fastsettingsmyndighet ?? "",
    hjemmel: dokref.hjemmel ?? "",
    rettskildeId: dokref.rettskildeId ?? "",
    rettskildeTittel: dokref.rettskildeTittel,
    dokumentlenker: dokref.dokumentlenker.map((lenke) => ({
      apiId: lenke.id,
      beskrivelse: lenke.beskrivelse,
    })),
    internReferanserKartverket: dokref.internReferanserKartverket.map(
      (ref) => ({
        apiId: ref.id,
        beskrivelse: ref.beskrivelse,
      }),
    ),
  }));
};

const mapFromFormToApi = (data: Inputs): Dokref[] => {
  return data.dokrefs.map((dokref) => ({
    id: dokref.apiId,
    rettskildeTittel: dokref.rettskildeTittel,
    fastsettingsdato: dokref.fastsettingsdato,
    fastsettingsmyndighet: dokref.fastsettingsmyndighet,
    hjemmel: dokref.hjemmel,
    rettskildeId: dokref.rettskildeId,
    dokumentlenker: dokref.dokumentlenker.map((lenke) => ({
      id: lenke.apiId,
      beskrivelse: lenke.beskrivelse,
    })),
    internReferanserKartverket: dokref.internReferanserKartverket.map(
      (ref) => ({
        id: ref.apiId,
        beskrivelse: ref.beskrivelse,
      }),
    ),
  }));
};

const updateFeatureWithNewMetadata = (
  feature: Feature<LineString>,
  newMetadata: Metadata,
) => {
  const properties = feature.getProperties() as FeatureProperties;
  feature.setProperties({
    ...properties,
    metadata: newMetadata,
  });
};

export const addMetadataEntryFromFeature = (
  feature: Feature<LineString>,
  addHistoryEntry: (entry: MetadataEntry) => void,
  updatedMetadata: Metadata,
) => {
  const id = feature.getId();

  if (!id) return;

  const oldMetadata = feature.getProperties().metadata as Metadata;

  updateFeatureWithNewMetadata(feature as Feature<LineString>, updatedMetadata);

  addHistoryEntry({
    type: "metadata",
    changes: [
      {
        id: id as string,
        from: oldMetadata,
        to: feature.getProperties().metadata as Metadata,
      },
    ],
  });
};

export const useDokumentreferanser = (feature: Feature) => {
  const properties = feature.getProperties() as FeatureProperties;
  const dokrefs = (properties.metadata as Metadata).dokumentasjonsreferanser;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    getValues,
    control,
    formState: { isDirty },
  } = useForm<Inputs>({
    defaultValues: { dokrefs: mapFromApiToForm(dokrefs) },
  });

  const { addHistoryEntry } = useHistory();

  useEffect(() => {
    const updateFormOnPropertyChange = (e: ObjectEvent) => {
      const newMetadata = (e.target as Feature<LineString>).getProperties()
        .metadata as Metadata;

      setValue(
        "dokrefs",
        mapFromApiToForm(newMetadata.dokumentasjonsreferanser),
      );
    };
    feature.on("propertychange", updateFormOnPropertyChange);

    return () => {
      feature.un("propertychange", updateFormOnPropertyChange);
    };
  }, [feature, setValue]);

  const updateDraftFromFeature = () => {
    const metadata = feature.getProperties().metadata as Metadata;
    addMetadataEntryFromFeature(
      feature as Feature<LineString>,
      addHistoryEntry,
      {
        ...metadata,
        dokumentasjonsreferanser: mapFromFormToApi(getValues()),
      },
    );
  };

  return {
    register,
    handleSubmit,
    reset,
    mapFromApiToForm,
    updateDraftFromFeature,
    getValues,
    setValue,
    isDirty,
    control,
  };
};
