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
  dokrefs: Referanse[],
  internrefs: Referanse[],
): Dokref => {
  return {
    id: formValues.id,
    rettskildeTittel: formValues.rettskildeTittel,
    fastsettingsdato: formValues.fastsettingsdato,
    fastsettingsmyndighet: formValues.fastsettingsmyndighet,
    hjemmel: formValues.hjemmel,
    rettskildeId: formValues.rettskildeId,
    dokumentlenker: dokrefs.map((ref) => ({
      id: ref.id,
      beskrivelse: ref.beskrivelse,
    })),
    internReferanserKartverket: internrefs.map((ref) => ({
      id: ref.id,
      beskrivelse: ref.beskrivelse,
    })),
  };
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

export const useDokumentreferanser = (
  feature: Feature,
  selectedVedtaksinfoIndex?: number,
) => {
  const defaultValues: Dokref =
    selectedVedtaksinfoIndex !== undefined
      ? feature.getProperties().metadata.dokumentasjonsreferanser[
          selectedVedtaksinfoIndex
        ]
      : {};

  const {
    register,
    setValue,
    getValues,
    reset,
    handleSubmit,
    formState: { isDirty },
  } = useForm<VedtakinfoForm>({ defaultValues: defaultValues });
  const [dokref, setDokref] = useState<Referanse[]>(
    defaultValues.dokumentlenker || [],
  );
  const [internref, setInternref] = useState<Referanse[]>(
    defaultValues.internReferanserKartverket || [],
  );
  const { addHistoryEntry } = useHistory();

  // Setter input-feltene til eksisterende skjema, dersom det redigeres
  if (selectedVedtaksinfoIndex !== undefined) {
    for (const key of Object.keys(defaultValues)) {
      setValue(
        key as keyof VedtakinfoForm,
        feature.getProperties().metadata.dokumentasjonsreferanser[
          selectedVedtaksinfoIndex
        ][key],
      );
    }
  }

  const updateDraftFromFeature = (vedtaksinfo: Dokref) => {
    const metadata = feature.getProperties().metadata as Metadata;

    if (selectedVedtaksinfoIndex === undefined) {
      // Implisitt en ny dokumentasjonsreferanse ved mangel av index.
      // Finner eksisterende dokumentasjonsreferanser, tar en overfladisk kopi av listen, og oppdaterer deretter featuren og historikken.
      const oldDokrefs: Dokref[] = metadata.dokumentasjonsreferanser
        ? metadata.dokumentasjonsreferanser
        : [];
      const dokrefsCopy = oldDokrefs.slice();
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
      const dokrefsCopy = oldDokrefs.slice();

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
    dokref,
    setDokref,
    internref,
    setInternref,
    handleSubmit,
    register,
    reset,
    getValues,
    setValue,
  };
};
