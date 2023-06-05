import styled from "styled-components";
import { PanelHeader, PanelProps, SidePanel } from "../Panel";
import { useOverlayPanel } from "contexts/OverlayPanelContext";
import { useUtkast, useUtkastEntity } from "contexts/UtkastContext";
import {
  StemmekretsResponse,
  StemmekretsSammenslaaingsendringRequest,
} from "types/api";
import { getIdFromEntity } from "utils/api";
import { FormProvider, useForm } from "react-hook-form";
import { MergeFormData } from "./MergeForm";
import { useErrorHandling } from "contexts/ErrorHandlingContext";
import { useCallback, useState } from "react";
import Input from "components/form/Input";
import { Divider } from "components/Divider";
import { useAuthenticationFlow } from "@kartverket/frontend-aut-lib";
import Button from "components/form/Button";
import { useTranslation } from "react-i18next";
import CreateUtkastModal, {
  CreateUtkastCallbackArgument,
} from "./CreateUtkastModal";
import { stemmekretsgrenserFetcher } from "api/stemmekrets";
import { deduplicate, removeNull } from "utils/list-utils";
import { MergeMultiselect } from "./MergeMultiselect";
import Select from "components/form/Select/Select";
import { useKommuneStemmekretser } from "hooks/inndelinger/useStemmekretser";
import Heading from "components/typography/Heading";
import { useFeatureStyle } from "contexts/FeatureStyleContext/FeatureStyleContext";

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const SectionHeading = styled(Heading)`
  margin: 0;
`;

const InputsWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 16px;

  input {
    width: 100%;
  }
`;

const Buttons = styled.div`
  display: flex;
  justify-content: end;
  gap: 16px;
  margin-top: auto;
`;

const MergePanel = ({ isOpen, className }: PanelProps) => {
  const [isCreateUtkastModalOpen, setIsCreateUtkastModalOpen] = useState(false);
  const { t } = useTranslation();
  const { flatedata, closeOverlayPanel } = useOverlayPanel();
  const { setError } = useErrorHandling();
  const { utkast, updateUtkast } = useUtkast();
  const { tokenHolderFunc } = useAuthenticationFlow();
  const { setAndSaveSammenslaaingsFeatures } = useFeatureStyle();
  const { data: stemmekretserByKommune } = useKommuneStemmekretser(
    flatedata ? getIdFromEntity(flatedata) : ""
  );

  const utkastStemmekretser = useUtkastEntity(
    stemmekretserByKommune,
    "stemmekretsendringer"
  ) as StemmekretsResponse[] | undefined;

  const formMethods = useForm<MergeFormData>({
    defaultValues: {
      stemmekretsNummerTilSammenslaaing: [{ value: "default" }],
    },
  });
  const {
    register,
    handleSubmit,
    getValues,
    setValue,
    reset,
    formState: { errors, isDirty },
  } = formMethods;

  const stemmekretsnavnValidator = {
    required: t("stemmekrets.validering.stemmekretsnavn.obligatorisk"),
  };

  const stemmekretsnummerValidator = {
    required: t("stemmekrets.validering.stemmekretsnummer.obligatorisk"),
    pattern: {
      value: /^\d+$/,
      message: t("stemmekrets.validering.stemmekretsnummer.gyldig-nummer"),
    },
    minValue: {
      value: 1,
      message: t("stemmekrets.validering.stemmekretsnummer.gyldig-nummer"),
    },
    maxLength: {
      value: 4,
      message: t("stemmekrets.validering.stemmekretsnummer.for-kort"),
    },
  };

  const getStemmekretsByNummer = useCallback(
    (nummer: string): StemmekretsResponse | null => {
      return (
        utkastStemmekretser?.find(
          (krets) => krets.stemmekretsnummer === nummer
        ) ?? null
      );
    },
    [utkastStemmekretser]
  );

  const getOverlappingStemmekretsFeatureIds = (featureIds: string[]) => {
    return featureIds.filter(
      (featureId, index) => featureIds.indexOf(featureId) !== index
    );
  };

  const fromFormToRequest = (
    stemmekretsRespons: StemmekretsResponse,
    sammenslaaingsStemmekretser: StemmekretsResponse[]
  ): StemmekretsSammenslaaingsendringRequest => ({
    viderefoertStemmekrets: {
      lokalId: stemmekretsRespons.id.lokalid.value,
      version: stemmekretsRespons.version,
    },
    stemmekretserTilSammenslaaing: deduplicate(sammenslaaingsStemmekretser).map(
      (sammenslaaingsStemmekrets) => ({
        lokalId: sammenslaaingsStemmekrets.id.lokalid.value,
        version: sammenslaaingsStemmekrets.version,
      })
    ),
    stemmekretsNavn: getValues("stemmekretsnavn"),
    stemmekretsNummer: getValues("stemmekretsnummer"),
  });

  const mergeStemmekrets = async (nyttUtkast: CreateUtkastCallbackArgument) => {
    const selectedStemmekretsValue = getValues("stemmekrets");
    const stemmekretsNummerTilSammenslaaing: string[] = getValues(
      "stemmekretsNummerTilSammenslaaing"
    ).map((s) => s.value);

    const selectedStemmekrets = getStemmekretsByNummer(
      selectedStemmekretsValue
    );

    const stemmekretsTilSammenslaaingListe = removeNull(
      stemmekretsNummerTilSammenslaaing.map((s) => getStemmekretsByNummer(s))
    );

    if (stemmekretsTilSammenslaaingListe.length > 0 && selectedStemmekrets) {
      const updateUtkastRequest = {
        version: 1,
        navn: nyttUtkast.navn,
        endringstype: nyttUtkast.endringstype,
        operasjoner: {
          ...nyttUtkast.operasjoner,
          stemmekretsSammenslaaingsendring: fromFormToRequest(
            selectedStemmekrets,
            stemmekretsTilSammenslaaingListe
          ),
        },
      };
      updateUtkast(nyttUtkast.id, updateUtkastRequest);
      const sammenslaaingsStemmekretsIder = getStemmekretsIdList(
        selectedStemmekrets,
        stemmekretsTilSammenslaaingListe
      );

      const stemmekretsFeatureIds: string[] = await fetchStemmekretsgrenser(
        sammenslaaingsStemmekretsIder
      );
      const overlappingFeatureIds = getOverlappingStemmekretsFeatureIds(
        stemmekretsFeatureIds
      );

      setAndSaveSammenslaaingsFeatures(
        stemmekretsFeatureIds,
        overlappingFeatureIds
      );
    }
    closeOverlayPanel();
    reset();
  };

  const fetchStemmekretsgrenser = async (stemmekretsIder: string[]) => {
    const stemmekretsgrenserResponse = await stemmekretsgrenserFetcher(
      stemmekretsIder,
      tokenHolderFunc()?.token
    );
    return stemmekretsgrenserResponse
      ? stemmekretsgrenserResponse
          .filter((value) => value != null)
          .map((value) => String(value))
      : [];
  };

  const getStemmekretsIdList = (
    selectedStemmekrets: StemmekretsResponse,
    stemmekretserTilSammenslaaing: StemmekretsResponse[]
  ) => {
    const stemmekretsIderTilSammenslaaing = stemmekretserTilSammenslaaing.map(
      (stemmekretsRef) => stemmekretsRef.id.lokalid.value
    );
    if (selectedStemmekrets) {
      stemmekretsIderTilSammenslaaing.push(
        selectedStemmekrets.id.lokalid.value
      );
    }

    return stemmekretsIderTilSammenslaaing;
  };

  const openCreateUtkastModal = () => {
    if (utkast) {
      setError({
        title: t("stemmekrets.utkast-sammenslaaing-alert.tittel"),
        body: t("stemmekrets.utkast-sammenslaaing-alert.tekst"),
      });
      return;
    }
    isCreateUtkastModalOpen
      ? setIsCreateUtkastModalOpen(false)
      : setIsCreateUtkastModalOpen(true);
  };

  // Oppdaterer stemmekretsnavn og stemmekretsnummer når valgt stemmekrets endres
  const selectStemmekretsRegister = register("stemmekrets");
  const updateDefaultValues = (value: string) => {
    const selectedStemmekrets = getStemmekretsByNummer(value);
    setValue("stemmekretsnavn", selectedStemmekrets?.stemmekretsnavn ?? "");
    setValue("stemmekretsnummer", selectedStemmekrets?.stemmekretsnummer ?? "");
  };

  return (
    <SidePanel isOpen={isOpen} className={className}>
      <PanelHeader onClose={closeOverlayPanel}>
        Slå sammen stemmekretser
      </PanelHeader>
      {utkastStemmekretser && (
        <FormProvider {...formMethods}>
          <Form onSubmit={handleSubmit(openCreateUtkastModal)}>
            <SectionHeading tag="h3" size="xs">
              Hvilken stemmekrets skal brukes som utgangspunkt?
            </SectionHeading>
            <Select
              {...selectStemmekretsRegister}
              onChange={(e) => {
                selectStemmekretsRegister.onChange(e);
                updateDefaultValues(e.currentTarget.value);
              }}
              defaultValue="default"
              label="Stemmekrets"
            >
              <option value={"default"} disabled>
                {t("stemmekrets.sammenslaaing.actions.velg")}
              </option>
              {utkastStemmekretser
                .sort(
                  (a, b) =>
                    parseInt(a.stemmekretsnummer) -
                    parseInt(b.stemmekretsnummer)
                )
                .map((stemmekrets) => (
                  <option
                    key={stemmekrets.id.lokalid.value}
                    value={stemmekrets.stemmekretsnummer}
                  >
                    {`${stemmekrets.stemmekretsnummer} - ${stemmekrets.stemmekretsnavn}`}
                  </option>
                ))}
            </Select>
            <Divider />
            <SectionHeading tag="h3" size="xs">
              Hvilke stemmekretser ønsker du å slå sammen med denne kretsen?
            </SectionHeading>
            <MergeMultiselect alleStemmekretser={utkastStemmekretser} />
            <Divider />
            <SectionHeading tag="h3" size="xs">
              Hva skal den sammenslåtte stemmekretsen hete?
            </SectionHeading>
            <InputsWrapper>
              <Input
                label={t(
                  "stemmekrets.sammenslaaing.detaljer-label-stemmekretsnummer"
                )}
                {...register("stemmekretsnummer", stemmekretsnummerValidator)}
                validationError={{
                  showError: !!errors?.stemmekretsnummer,
                  message: errors.stemmekretsnummer?.message ?? "",
                }}
              />
              <Input
                label={t(
                  "stemmekrets.sammenslaaing.detaljer-label-stemmekretsnavn"
                )}
                {...register("stemmekretsnavn", stemmekretsnavnValidator)}
                validationError={{
                  showError: !!errors.stemmekretsnavn,
                  message: errors.stemmekretsnavn?.message ?? "",
                }}
              />
            </InputsWrapper>
            <Buttons>
              <Button
                onClick={() => {
                  closeOverlayPanel();
                  reset();
                }}
                variant="tertiary"
              >
                {t("stemmekrets.sammenslaaing.actions.avbryt")}
              </Button>
              <Button type="submit" disabled={!isDirty}>
                {t("stemmekrets.sammenslaaing.actions.slaa-sammen")}
              </Button>
            </Buttons>
            <CreateUtkastModal
              isCreateUtkastModalOpen={isCreateUtkastModalOpen}
              setIsCreateUtkastModalOpen={setIsCreateUtkastModalOpen}
              callback={mergeStemmekrets}
            />
          </Form>
        </FormProvider>
      )}
    </SidePanel>
  );
};

export default MergePanel;
