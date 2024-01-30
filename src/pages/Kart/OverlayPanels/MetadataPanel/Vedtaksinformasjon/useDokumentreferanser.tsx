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

  // TODO: Lag en dyp kopi
  const oldMetadata = feature.getProperties().metadata as Metadata;

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

export const useDokumentreferanser = (feature: Feature, dokrefId?: string) => {
  const { register, setValue, getValues, reset, handleSubmit } =
    useForm<VedtakinfoForm>();

  const [dokref, setDokref] = useState<Referanse[]>([]);
  const [internref, setInternref] = useState<Referanse[]>([]);
  const { addHistoryEntry } = useHistory();

  const updateDraftFromFeature = (vedtaksinfo: Dokref) => {
    const metadata = feature.getProperties().metadata as Metadata;

    if (!dokrefId) {
      // Implisitt en ny dokumentasjonsreferanse ved mangel av id.
      // Finner eksisterende dokumentasjonsreferanser, tar en shallow kopi av listen, og oppdaterer deretter featuren og historikken.
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
      const oldDokrefIndex = dokrefsCopy.findIndex(
        (ref) => ref.id === dokrefId,
      );

      if (oldDokrefIndex === -1)
        throw Error(
          "Kunne ikke finne dokumentasjonsreferanse med id: " + dokrefId,
        );

      dokrefsCopy[oldDokrefIndex] = vedtaksinfo;

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
