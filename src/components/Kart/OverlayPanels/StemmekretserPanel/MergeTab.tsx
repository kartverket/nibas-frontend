import Button from "components/form/Button";
import Input from "components/form/Input";
import Heading from "components/typography/Heading";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import {
  StemmekretsRef,
  StemmekretsResponse,
  StemmekretsSammenslaaingsendringRequest,
} from "types/api";
import { Section, ContrastSection } from "./components";
import { getIdFromEntity } from "utils/api";
import CreateUtkastModal, {
  CreateUtkastCallbackArgument,
} from "./CreateUtkastModal";
import { useUtkast } from "contexts/UtkastContext";
import { useErrorHandling } from "contexts/ErrorHandlingContext";
import { useToolbar } from "contexts/ToolbarContext";
import { useAuthenticationFlow } from "@kartverket/frontend-aut-lib";
import { stemmekretsgrenserFetcher } from "api/stemmekrets";
import { deduplicate, removeNull } from "utils/list-utils";
import { SammenslaaingMultiselect } from "./SammenslaaingMultiselect";
import Toast from "components/Kart/Toolbar/Toast";
import { useForm, FormProvider } from "react-hook-form";
import { SammenslaaingFormData } from "./SammanslaaingForm";
import Icon from "components/Icon/Icon";

type Props = {
  stemmekrets: StemmekretsResponse | undefined;
  alleStemmekretser: StemmekretsRef[];
  toggleRow: (id: string) => void;
};

const MergeTab = ({ stemmekrets, alleStemmekretser, toggleRow }: Props) => {
  const { t } = useTranslation();

  const { utkast, updateUtkast } = useUtkast();
  const { setError } = useErrorHandling();
  const { tokenHolderFunc } = useAuthenticationFlow();
  const { setAndSaveSammenslaaingsFeatures } = useToolbar();

  const [isCreateUtkastModalOpen, setIsCreateUtkastModalOpen] = useState(false);
  const [utkastJustCreated, setUtkastJustCreated] = useState(false);

  const formMethods = useForm<SammenslaaingFormData>({
    defaultValues: {
      stemmekretsnavn: stemmekrets?.stemmekretsnavn ?? "",
      stemmekretsnummer: stemmekrets?.stemmekretsnummer ?? "",
      stemmekretsNummerTilSammenslaaing: [{ value: "default" }],
    },
  });

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isValid, isSubmitted },
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

  const stemmekretsId = stemmekrets ? getIdFromEntity(stemmekrets) : "";

  const fromFormToRequest = (
    stemmekretsRespons: StemmekretsResponse,
    sammenslaaingsStemmekretser: StemmekretsRef[]
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

  const getStemmekretsByNummer = (nummer: string): StemmekretsRef | null => {
    return alleStemmekretser.find((krets) => krets.nummer === nummer) ?? null;
  };

  const getOverlappingStemmekretsFeatureIds = (featureIds: string[]) => {
    return featureIds.filter(
      (featureId, index) => featureIds.indexOf(featureId) !== index
    );
  };

  const mergeStemmekrets = async (nyttUtkast: CreateUtkastCallbackArgument) => {
    const stemmekretsNummerTilSammenslaaing: string[] = getValues(
      "stemmekretsNummerTilSammenslaaing"
    ).map((s) => s.value);

    const stemmekretsTilSammenslaaingListe = removeNull(
      stemmekretsNummerTilSammenslaaing.map((s) => getStemmekretsByNummer(s))
    );

    if (stemmekretsTilSammenslaaingListe.length > 0 && stemmekrets) {
      const updateUtkastRequest = {
        version: 1,
        navn: nyttUtkast.navn,
        endringstype: nyttUtkast.endringstype,
        operasjoner: {
          ...nyttUtkast.operasjoner,
          stemmekretsSammenslaaingsendring: fromFormToRequest(
            stemmekrets,
            stemmekretsTilSammenslaaingListe
          ),
        },
      };
      updateUtkast(nyttUtkast.id, updateUtkastRequest);
      const sammenslaaingsStemmekretsIder = getStemmekretsIdList(
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
    promptUtkastJustCreated();
  };

  const getStemmekretsIdList = (
    stemmekretserTilSammenslaaing: StemmekretsRef[]
  ) => {
    const stemmekretsIderTilSammenslaaing = stemmekretserTilSammenslaaing.map(
      (stemmekretsRef) => stemmekretsRef.id.lokalid.value
    );
    if (stemmekrets) {
      stemmekretsIderTilSammenslaaing.push(stemmekrets.id.lokalid.value);
    }

    return stemmekretsIderTilSammenslaaing;
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

  const promptUtkastJustCreated = () => {
    setUtkastJustCreated(true);

    setTimeout(() => {
      setUtkastJustCreated(false);
    }, 7000);
  };

  return (
    <FormProvider {...formMethods}>
      <form onSubmit={handleSubmit(openCreateUtkastModal)}>
        <Section>
          <SectionHeading>
            {t("stemmekrets.sammenslaaing.tittel")}
          </SectionHeading>
          <SammenslaaingMultiselect
            stemmekretsnavn={stemmekrets?.stemmekretsnavn ?? ""}
            alleStemmekretser={alleStemmekretser}
          />
        </Section>
        <ContrastSection>
          <SectionHeading>
            {t("stemmekrets.sammenslaaing.detaljer-tittel")}
          </SectionHeading>
          <br />
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
        </ContrastSection>
        <Section>
          <Buttons>
            <Button onClick={() => toggleRow(stemmekretsId)} variant="tertiary">
              {t("stemmekrets.sammenslaaing.actions.avbryt")}
            </Button>
            <Button type="submit">
              {t("stemmekrets.sammenslaaing.actions.slaa-sammen")}
            </Button>
          </Buttons>
          {!isValid && isSubmitted && (
            <ErrorBox>
              <Icon icon="warning_amber" />
              {t("stemmekrets.validering.har-feil")}
            </ErrorBox>
          )}
        </Section>
        <CreateUtkastModal
          isCreateUtkastModalOpen={isCreateUtkastModalOpen}
          setIsCreateUtkastModalOpen={setIsCreateUtkastModalOpen}
          callback={mergeStemmekrets}
        />
        {utkastJustCreated && (
          <Toast text={t("stemmekretssammenslaaing.lagt-til-i-utkast")} />
        )}
      </form>
    </FormProvider>
  );
};

const ErrorBox = styled.div`
  color: var(--red_error_message);
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-top: 16px;
  gap: 6px;

  .material-symbols-outlined {
    font-size: inherit;
    margin-top: 2px;
  }
`;

const SectionHeading = styled(Heading).attrs({ tag: "h3", size: "xs" })`
  margin: 0;
`;

const Buttons = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 20px;
`;

const InputsWrapper = styled.div`
  display: flex;
  gap: 16px;
  width: 80%;

  > * {
    width: 100%;

    &:first-child {
      flex: 1;
    }

    &:last-child {
      flex: 3;
    }
  }
`;

export default MergeTab;
