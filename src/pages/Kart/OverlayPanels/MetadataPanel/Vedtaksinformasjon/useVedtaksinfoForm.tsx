import { Feature } from "ol";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Dokref, FeatureProperties, Metadata } from "types/api";
import { VedtakinfoForm, Referanse } from "./OversiktReferanser";
import { LineString } from "ol/geom";
import { MetadataEntry } from "contexts/HistoryContext/types";
import { useHistory } from "contexts/HistoryContext";

export const mapFromFormToApi = (
  formValues: VedtakinfoForm,
  dokrefs: Referanse[] | undefined,
  internrefs: Referanse[] | undefined,
): Dokref => {
  return {
    id: formValues.id,
    rettskildeTittel: formValues.rettskildeTittel,
    fastsettingsdato: formValues.fastsettingsdato,
    fastsettingsmyndighet: formValues.fastsettingsmyndighet,
    hjemmel: formValues.hjemmel,
    rettskildeId: formValues.rettskildeId,
    dokumentlenker:
      dokrefs?.map((ref) => ({
        id: ref.id,
        beskrivelse: ref.beskrivelse,
      })) || [],
    internReferanserKartverket:
      internrefs?.map((ref) => ({
        id: ref.id,
        beskrivelse: ref.beskrivelse,
      })) || [],
  };
};

const emptyVedtaksinformasjon = {
  id: undefined,
  rettskildeTittel: "",
  rettskildeId: "",
  dokumentlenker: [],
  internreferanserKartverket: [],
  fastsettingsdato: "",
  fastsettingsmyndighet: "",
  hjemmel: "",
  leggTilInternreferanse: undefined,
  leggTilDokumentlenke: undefined,
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

const addMetadataEntryFromFeature = (
  feature: Feature<LineString>,
  addHistoryEntry: (entry: MetadataEntry) => void,
  updatedMetadata: Metadata,
) => {
  const id = feature.getId();
  const oldMetadata = structuredClone(
    feature.getProperties().metadata,
  ) as Metadata;

  if (!id) return;

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

export const useVedtaksinfoForm = (
  feature: Feature,
  selectedVedtaksinfoIndex?: number,
) => {
  const values: VedtakinfoForm =
    selectedVedtaksinfoIndex !== undefined
      ? feature.getProperties().metadata.dokumentasjonsreferanser[
          selectedVedtaksinfoIndex
        ]
      : emptyVedtaksinformasjon;

  const {
    register,
    setValue,
    getValues,
    reset,
    handleSubmit,
    formState: { isDirty },
    watch,
  } = useForm<VedtakinfoForm>({
    defaultValues: emptyVedtaksinformasjon,
    values: values,
  });

  const { addHistoryEntry } = useHistory();
  const updateDraftFromFeature = (vedtaksinfo: Dokref) => {
    const metadata = feature.getProperties().metadata as Metadata;

    if (selectedVedtaksinfoIndex === undefined) {
      // Implisitt en ny dokumentasjonsreferanse ved mangel av index.
      const oldDokrefs: Dokref[] = metadata.dokumentasjonsreferanser
        ? metadata.dokumentasjonsreferanser
        : [];
      const dokrefsCopy = structuredClone(oldDokrefs);
      dokrefsCopy.push(vedtaksinfo);

      addMetadataEntryFromFeature(
        feature as Feature<LineString>,
        addHistoryEntry,
        {
          ...metadata,
          dokumentasjonsreferanser: dokrefsCopy,
        },
      );
    } else {
      // Oppdaterer eksisterende dokumentasjonsreferanse
      const oldDokrefs: Dokref[] = metadata.dokumentasjonsreferanser
        ? metadata.dokumentasjonsreferanser
        : [];
      const dokrefsCopy = structuredClone(oldDokrefs);
      dokrefsCopy[selectedVedtaksinfoIndex] = vedtaksinfo;

      addMetadataEntryFromFeature(
        feature as Feature<LineString>,
        addHistoryEntry,
        {
          ...metadata,
          dokumentasjonsreferanser: dokrefsCopy,
        },
      );
    }
  };

  return {
    isDirty,
    updateDraftFromFeature,
    handleSubmit,
    register,
    reset,
    getValues,
    setValue,
    watch,
  };
};
