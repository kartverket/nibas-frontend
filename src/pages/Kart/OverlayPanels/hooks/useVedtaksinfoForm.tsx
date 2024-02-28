import { Feature } from "ol";
import { useForm } from "react-hook-form";
import { DokumentasjonsreferanseDTO, FeatureProperties, Metadata } from "types/api";
import { VedtakinfoForm, Referanse } from "../GrenseinformasjonPanel/Vedtaksinformasjon/Vedtaksinformasjon";
import { LineString } from "ol/geom";
import { PropertyEntry, useHistory } from "contexts/HistoryContext";
import { useConfirmationModal } from "contexts/ConfirmationModalContext";

export const mapFromFormToApi = (
  formValues: VedtakinfoForm,
  dokrefs: Referanse[] | undefined,
  internrefs: Referanse[] | undefined,
): DokumentasjonsreferanseDTO => {
  if (!formValues.vedtakGyldigFra) throw Error("Gyldig fra er påkrevd!");

  return {
    shouldArchive: false,
    id: formValues.id,
    rettskildeTittel: formValues.rettskildeTittel,
    fastsettingsdato: formValues.fastsettingsdato.toISOString(),
    fastsettingsmyndighet: formValues.fastsettingsmyndighet,
    hjemmel: formValues.hjemmel,
    rettskildeId: formValues.rettskildeId,
    vedtakGyldigFra: formValues.vedtakGyldigFra.toISOString(),
    vedtakGyldigTil: formValues.vedtakGyldigTil?.toISOString(),
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

const emptyVedtaksinformasjon: VedtakinfoForm = {
  id: undefined,
  rettskildeTittel: "",
  rettskildeId: "",
  dokumentlenker: [],
  internreferanserKartverket: [],
  fastsettingsdato: new Date(),
  fastsettingsmyndighet: "",
  hjemmel: "",
  leggTilInternreferanse: undefined,
  leggTilDokumentlenke: undefined,
  vedtakGyldigFra: undefined,
  vedtakGyldigTil: undefined,
};

const updateFeatureWithNewMetadata = (feature: Feature<LineString>, newMetadata: Metadata) => {
  const properties = feature.getProperties() as FeatureProperties;
  feature.setProperties({
    ...properties,
    metadata: newMetadata,
  });
};

const addMetadataEntryFromFeature = (
  feature: Feature<LineString>,
  addHistoryEntry: (entry: PropertyEntry) => void,
  updatedMetadata: Metadata,
) => {
  const id = feature.getId();
  const oldProperties = feature.getProperties() as FeatureProperties;

  if (!id) return;

  updateFeatureWithNewMetadata(feature as Feature<LineString>, updatedMetadata);

  addHistoryEntry({
    type: "property",
    changes: [
      {
        id: id as string,
        from: oldProperties,
        to: feature.getProperties() as FeatureProperties,
      },
    ],
  });
};

export const useVedtaksinfoForm = (feature: Feature, selectedVedtaksinfoIndex?: number) => {
  const values: VedtakinfoForm =
    selectedVedtaksinfoIndex !== undefined
      ? structuredClone(feature.getProperties().metadata.dokumentasjonsreferanser[selectedVedtaksinfoIndex])
      : emptyVedtaksinformasjon;
  values.fastsettingsdato = new Date(values.fastsettingsdato);
  values.vedtakGyldigFra = values.vedtakGyldigFra ? new Date(values.vedtakGyldigFra) : undefined;
  values.vedtakGyldigTil = values.vedtakGyldigTil ? new Date(values.vedtakGyldigTil) : undefined;

  const { openAsync } = useConfirmationModal();

  const {
    register,
    setValue,
    getValues,
    reset,
    handleSubmit,
    formState: { isDirty, errors },
    watch,
    control,
    setError,
    clearErrors,
  } = useForm<VedtakinfoForm>({
    defaultValues: emptyVedtaksinformasjon,
    values: values,
  });

  const { addHistoryEntry } = useHistory();

  const deleteOrArchive = async (): Promise<boolean> => {
    if (selectedVedtaksinfoIndex == undefined) return false;

    const metadata = feature.getProperties().metadata as Metadata;
    const oldDokrefs: DokumentasjonsreferanseDTO[] = metadata.dokumentasjonsreferanser
      ? metadata.dokumentasjonsreferanser
      : [];

    const shouldDelete = !oldDokrefs[selectedVedtaksinfoIndex].id ? true : false;

    const shouldDeleteOrArchive = await openAsync({
      title: `${shouldDelete ? "Sletting" : "Arkivering"} av referanse`,
      description: `Er du sikker på at du ønsker å ${shouldDelete ? "slette" : "arkivere"} referansen?`,
    });

    if (!shouldDeleteOrArchive) return false;

    if (shouldDelete) {
      // Vedtaksinformasjonen er ikke tidligere publisert. Fjern fra front end
      const updatedDokrefs = structuredClone(oldDokrefs);
      updatedDokrefs.splice(selectedVedtaksinfoIndex, 1);
      addMetadataEntryFromFeature(feature as Feature<LineString>, addHistoryEntry, {
        ...metadata,
        dokumentasjonsreferanser: updatedDokrefs,
      });
    } else {
      // Arkiver eksisterende dokumentasjonsreferanse
      const dokrefsCopy = structuredClone(oldDokrefs);
      dokrefsCopy[selectedVedtaksinfoIndex].shouldArchive = true;
      addMetadataEntryFromFeature(feature as Feature<LineString>, addHistoryEntry, {
        ...metadata,
        dokumentasjonsreferanser: dokrefsCopy,
      });
    }

    return true;
  };

  const updateDraftFromFeature = (vedtaksinfo: DokumentasjonsreferanseDTO) => {
    const metadata = feature.getProperties().metadata as Metadata;

    if (selectedVedtaksinfoIndex === undefined) {
      // Implisitt en ny dokumentasjonsreferanse ved mangel av index.
      const oldDokrefs: DokumentasjonsreferanseDTO[] = metadata.dokumentasjonsreferanser
        ? metadata.dokumentasjonsreferanser
        : [];
      const dokrefsCopy = structuredClone(oldDokrefs);
      dokrefsCopy.push(vedtaksinfo);

      addMetadataEntryFromFeature(feature as Feature<LineString>, addHistoryEntry, {
        ...metadata,
        dokumentasjonsreferanser: dokrefsCopy,
      });
    } else {
      // Oppdaterer eksisterende dokumentasjonsreferanse
      const oldDokrefs: DokumentasjonsreferanseDTO[] = metadata.dokumentasjonsreferanser
        ? metadata.dokumentasjonsreferanser
        : [];
      const dokrefsCopy = structuredClone(oldDokrefs);
      dokrefsCopy[selectedVedtaksinfoIndex] = vedtaksinfo;

      addMetadataEntryFromFeature(feature as Feature<LineString>, addHistoryEntry, {
        ...metadata,
        dokumentasjonsreferanser: dokrefsCopy,
      });
    }
  };

  return {
    isDirty,
    errors,
    updateDraftFromFeature,
    handleSubmit,
    register,
    reset,
    getValues,
    setValue,
    watch,
    control,
    deleteOrArchive,
    setError,
    clearErrors,
  };
};
