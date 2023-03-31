import { useCallback, useEffect, useRef } from "react";
import { FieldError, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import Input, { ValidationError } from "components/form/Input/Input";
import { StemmekretsEntry, useToolbarSaving } from "contexts/ToolbarContext";
import useKretsToolbarSync from "contexts/ToolbarContext/useToolbarFormSync";
import { StemmekretsRequest, StemmekretsResponse } from "types/api";
import { getIdFromEntity } from "utils/api";
import styled from "styled-components";
import { Section } from "./components";
import { getRepresentasjonspunktId } from "utils/map/source";
import { updateEditFeatureText } from "utils/map/layerStyles";
import Button from "components/form/Button";

type Inputs = {
  stemmekretsnavn: string;
  stemmekretsnummer: string;
  tellekretsnavn: string;
  tellekretsnummer: string;
};

const fromFormToRequest = (
  data: Inputs,
  stemmekrets: StemmekretsResponse
): StemmekretsRequest => ({
  identifikasjon: {
    lokalid: getIdFromEntity(stemmekrets),
  },
  valgdistriktsnummer: stemmekrets.valgdistriktsnummer,
  version: stemmekrets.version,
  stemmekretsnavn: data.stemmekretsnavn,
  stemmekretsnummer: data.stemmekretsnummer,
  tellekretsnavn: data.tellekretsnavn,
  tellekretsnummer: data.tellekretsnummer,
});

type Props = {
  stemmekretsId: string;
  kommuneId: string;
  utkastStemmekrets: StemmekretsResponse | undefined;
};

const DetailsTab = ({ stemmekretsId, kommuneId, utkastStemmekrets }: Props) => {
  const { t } = useTranslation();
  const {
    register,
    setValue,
    getValues,
    handleSubmit,
    trigger,
    formState: { errors, isSubmitted },
  } = useForm<Inputs>();
  const { addEntry } = useToolbarSaving();
  const previousValues = useRef<Inputs>(getValues());

  useEffect(() => {
    if (!utkastStemmekrets) return;

    setValue("stemmekretsnavn", utkastStemmekrets.stemmekretsnavn);
    setValue("stemmekretsnummer", utkastStemmekrets.stemmekretsnummer);
    setValue("tellekretsnavn", utkastStemmekrets.tellekretsnavn ?? "");
    setValue("tellekretsnummer", utkastStemmekrets.tellekretsnummer ?? "");

    previousValues.current = getValues();
  }, [utkastStemmekrets, setValue, getValues]);

  const setFormValues = useCallback(
    (change: StemmekretsEntry["changes"][number], direction: "to" | "from") => {
      const newName = change[direction]?.stemmekretsnavn;
      const newNumber = change[direction]?.stemmekretsnummer;
      setValue("stemmekretsnavn", newName ?? "");
      setValue("stemmekretsnummer", newNumber ?? "");
      setValue("tellekretsnavn", change[direction]?.tellekretsnavn ?? "");
      setValue("tellekretsnummer", change[direction]?.tellekretsnummer ?? "");

      updateEditFeatureText(
        getRepresentasjonspunktId(stemmekretsId),
        newName,
        newNumber
      );
    },
    [setValue, stemmekretsId]
  );

  useKretsToolbarSync<StemmekretsEntry>({
    entityId: stemmekretsId,
    redoEventKey: "stemmekretsRedo",
    undoEventKey: "stemmekretsUndo",
    setFormValues,
  });

  const saveAndAddHistoryEntry = () => {
    if (!utkastStemmekrets) return;

    const newValues = getValues();

    addEntry({
      type: "stemmekrets",
      kommuneId,
      changes: [
        {
          from: fromFormToRequest(previousValues.current, utkastStemmekrets),
          to: fromFormToRequest(newValues, utkastStemmekrets),
          id: stemmekretsId,
        },
      ],
    });

    previousValues.current = newValues;
    updateEditFeatureText(
      getRepresentasjonspunktId(stemmekretsId),
      newValues.stemmekretsnavn,
      newValues.stemmekretsnummer
    );
  };

  // Denne skal oppføre seg som en XNOR, enten har begge feltene innhold, eller ingen av dem
  const isTellekretsSynced = (navn: string, nummer: string) => {
    return !navn.length === !nummer.length;
  };

  const isInteger = (s: string) => s.match(/^[0-9]+$/) !== null;

  const tellekretsValidateOnChange = () => {
    if (isSubmitted) {
      trigger();
    }
  };

  const formOptions = {
    stemmekretsnummer: {
      required: t("stemmekrets.validering.stemmekretsnummer.ikke-tomt"),
      validate: {
        isLessThanFiveFigures: (value: string) =>
          (isInteger(value) && value.length < 5) ||
          t("stemmekrets.validering.stemmekretsnummer.kun-siffer"),
        isPositive: (value: string) =>
          parseInt(value) > 0 ||
          t("stemmekrets.validering.stemmekretsnummer.kun-positiv"),
      },
    },
    stemmekretsnavn: {
      required: t("stemmekrets.validering.stemmekretsnavn.ikke-tomt"),
    },
    tellekretsnummer: {
      validate: {
        isTellekretsValid: (value: string) =>
          isTellekretsSynced(getValues("tellekretsnavn"), value) ||
          t("stemmekrets.validering.tellekretsnummer.både-eller-ingen"),
        isNumber: (value: string) =>
          (getValues("tellekretsnavn").length && isInteger(value)) ||
          t("stemmekrets.validering.tellekretsnummer.kun-tall"),
        isPositive: (value: string) =>
          (getValues("tellekretsnavn").length && parseInt(value) > 0) ||
          t("stemmekrets.validering.tellekretsnummer.kun-positiv"),
      },
      onChange: tellekretsValidateOnChange,
    },
    tellekretsnavn: {
      validate: {
        isTellekretsValid: (value: string) =>
          isTellekretsSynced(value, getValues("tellekretsnummer")) ||
          t("stemmekrets.validering.tellekretsnummer.både-eller-ingen"),
      },
      onChange: tellekretsValidateOnChange,
    },
  };

  const validationError = (error: FieldError | undefined) => {
    if (error) {
      return {
        showError: error !== undefined,
        message: error.message,
      } as ValidationError;
    }
  };

  return (
    <DetailsSection as="form" onSubmit={handleSubmit(saveAndAddHistoryEntry)}>
      <Input
        label={t("stemmekrets.Stemmekretsnummer")}
        {...register("stemmekretsnummer", formOptions.stemmekretsnummer)}
        validationError={validationError(errors.stemmekretsnummer)}
      />
      <Input
        label={t("tabell.Stemmekretsnavn")}
        {...register("stemmekretsnavn", formOptions.stemmekretsnavn)}
        validationError={validationError(errors.stemmekretsnavn)}
      />
      <Input
        label={t("stemmekrets.Tellekretsnummer")}
        {...register("tellekretsnummer", formOptions.tellekretsnummer)}
        validationError={validationError(errors.tellekretsnummer)}
      />
      <Input
        label={t("stemmekrets.Tellekretsnavn")}
        {...register("tellekretsnavn", formOptions.tellekretsnavn)}
        validationError={validationError(errors.tellekretsnavn)}
      />
      <Button type="submit">{t("action.Lagre")}</Button>
    </DetailsSection>
  );
};

const DetailsSection = styled(Section)`
  display: grid;
  grid-template-columns: 185px 350px;
  gap: 30px 12px;
  color: var(--gray_dark);
`;

export default DetailsTab;
