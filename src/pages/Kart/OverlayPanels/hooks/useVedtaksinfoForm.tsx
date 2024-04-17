import { Feature } from "ol";
import { useForm } from "react-hook-form";
import { DokumentasjonsreferanseDTO, FeatureProperties, Metadata } from "types/api";
import { VedtakinfoForm, Referanse } from "../GrenseinformasjonPanel/Vedtaksinformasjon/Vedtaksinformasjon";
import { LineString } from "ol/geom";
import { useHistory } from "contexts/HistoryContext/HistoryContext";
import { PropertyEntry } from "contexts/HistoryContext/types";
import { useConfirmationModal } from "contexts/ConfirmationModalContext";
import {
  createUniqueIshValue,
  getDokumentasjonsReferanseFromFeature,
  isTempDokrefId,
} from "../GrenseinformasjonPanel/Vedtaksinformasjon/util/vedtaksinfoHelperMethods";

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

const mapFromApiToForm = (dokrefDTO: DokumentasjonsreferanseDTO): VedtakinfoForm => {
  return {
    dokumentlenker: dokrefDTO.dokumentlenker,
    fastsettingsdato: new Date(dokrefDTO.fastsettingsdato),
    internreferanserKartverket: dokrefDTO.internReferanserKartverket,
    rettskildeId: dokrefDTO.rettskildeId,
    rettskildeTittel: dokrefDTO.rettskildeTittel,
    vedtakGyldigFra: dokrefDTO.vedtakGyldigFra != null ? new Date(dokrefDTO.vedtakGyldigFra) : undefined,
    vedtakGyldigTil: dokrefDTO.vedtakGyldigTil != null ? new Date(dokrefDTO.vedtakGyldigTil) : undefined,
    fastsettingsmyndighet: dokrefDTO.fastsettingsmyndighet,
    hjemmel: dokrefDTO.hjemmel,
    id: dokrefDTO.id,
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
  vedtakGyldigFra: new Date(),
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
  addHistoryEntry: (entry: PropertyEntry[]) => void,
  updatedMetadata: Metadata,
) => {
  const id = feature.getId()?.toString();
  const oldProperties = feature.getProperties() as FeatureProperties;

  if (id == null) return;

  updateFeatureWithNewMetadata(feature as Feature<LineString>, updatedMetadata);

  addHistoryEntry([
    {
      type: "property",
      changes: [
        {
          id: id,
          from: oldProperties,
          to: feature.getProperties() as FeatureProperties,
        },
      ],
    },
  ]);
};

export const useVedtaksinfoForm = (feature: Feature, selectedVedtaksinfoId?: string) => {
  const getFormValues = (): VedtakinfoForm => {
    if (selectedVedtaksinfoId != null) {
      const dokrefFromFeature = getDokumentasjonsReferanseFromFeature(feature, selectedVedtaksinfoId);

      if (dokrefFromFeature) {
        return mapFromApiToForm(dokrefFromFeature);
      }
    }

    return emptyVedtaksinformasjon;
  };

  const values: VedtakinfoForm = getFormValues();

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
    if (selectedVedtaksinfoId == null) return false;
    const metadata = feature.getProperties().metadata as Metadata;
    const oldDokrefs: DokumentasjonsreferanseDTO[] = metadata.dokumentasjonsreferanser
      ? metadata.dokumentasjonsreferanser
      : [];

    const selectedDokref = oldDokrefs.find((dokref) => dokref.id === selectedVedtaksinfoId);
    if (!selectedDokref) return false;

    const isDeleting = isTempDokrefId(selectedDokref.id);

    const shouldDeleteOrArchive = await openAsync({
      title: `${isDeleting ? "Sletting" : "Arkivering"} av referanse`,
      description: `Er du sikker på at du ønsker å ${isDeleting ? "slette" : "arkivere"} referansen?`,
      acceptText: `Ja, ${isDeleting ? "slett" : "arkiver"}`,
      declineText: "Avbryt",
    });

    if (!shouldDeleteOrArchive) return false;

    if (isTempDokrefId(selectedDokref.id)) {
      // Vedtaksinformasjonen er ikke tidligere publisert. Fjern fra front end
      const updatedDokrefs = oldDokrefs.filter((dokref) => dokref.id !== selectedVedtaksinfoId);
      addMetadataEntryFromFeature(feature as Feature<LineString>, addHistoryEntry, {
        ...metadata,
        dokumentasjonsreferanser: updatedDokrefs,
      });
    } else {
      // Arkiver eksisterende dokumentasjonsreferanse
      const dokrefsCopy = structuredClone(oldDokrefs);
      const selectedVedtakIndex = dokrefsCopy.findIndex((dokref) => dokref.id === selectedVedtaksinfoId);
      if (dokrefsCopy[selectedVedtakIndex] != null) dokrefsCopy[selectedVedtakIndex].shouldArchive = true;
      addMetadataEntryFromFeature(feature as Feature<LineString>, addHistoryEntry, {
        ...metadata,
        dokumentasjonsreferanser: dokrefsCopy,
      });
    }

    return true;
  };

  const updateDraftFromFeature = (vedtaksinfo: DokumentasjonsreferanseDTO) => {
    const metadata = feature.getProperties().metadata as Metadata;

    if (selectedVedtaksinfoId == null) {
      // Implisitt en ny dokumentasjonsreferanse ved mangel av index.
      const oldDokrefs: DokumentasjonsreferanseDTO[] = metadata.dokumentasjonsreferanser
        ? metadata.dokumentasjonsreferanser
        : [];
      const dokrefsCopy = structuredClone(oldDokrefs);
      vedtaksinfo.id = createUniqueIshValue(16);
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
      const selectedVedtakIndex = dokrefsCopy.findIndex((dokref) => dokref.id === selectedVedtaksinfoId);
      dokrefsCopy[selectedVedtakIndex] = vedtaksinfo;

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
