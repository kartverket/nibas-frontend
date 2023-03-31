import { useCallback, useEffect, useRef } from "react";
import { FieldError, RegisterOptions, useForm } from "react-hook-form";
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
    formState: { errors, isSubmitted, isDirty },
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

  const isInteger = (s: string) => s.match(/^\d+$/) !== null;

  const tellekretsValidateOnChange = () => {
    if (isSubmitted) {
      trigger();
    }
  };

  const formOptions: Record<string, RegisterOptions> = {
    stemmekretsnummer: {
      required: t("stemmekrets.validering.stemmekretsnummer.ikke-tomt"),
      validate: (stemmekretsnummer: string) => {
        if (!isInteger(stemmekretsnummer) || stemmekretsnummer.length > 4) {
          return t("stemmekrets.validering.stemmekretsnummer.kun-siffer");
        }
        if (parseInt(stemmekretsnummer) <= 0) {
          return t("stemmekrets.validering.stemmekretsnummer.kun-positiv");
        }
        return true;
      },
    },
    stemmekretsnavn: {
      required: t("stemmekrets.validering.stemmekretsnavn.ikke-tomt"),
    },
    tellekretsnummer: {
      validate: (tellekretsnummer: string) => {
        const tellekretsnavn = getValues("tellekretsnavn");

        const isTellekretsEmpty =
          tellekretsnummer.length === 0 && tellekretsnavn.length === 0;

        if (!isTellekretsSynced(tellekretsnavn, tellekretsnummer)) {
          return t("stemmekrets.validering.tellekretsnummer.både-eller-ingen");
        }
        if (!isTellekretsEmpty && !isInteger(tellekretsnummer)) {
          return t("stemmekrets.validering.tellekretsnummer.kun-tall");
        }
        if (!isTellekretsEmpty && parseInt(tellekretsnummer) <= 0) {
          return t("stemmekrets.validering.tellekretsnummer.kun-positiv");
        }
        return true;
      },
      onChange: tellekretsValidateOnChange,
    },
    tellekretsnavn: {
      validate: (tellekretsnavn: string) => {
        const tellekretsnummer = getValues("tellekretsnummer");
        if (!isTellekretsSynced(tellekretsnavn, tellekretsnummer)) {
          return t("stemmekrets.validering.tellekretsnummer.både-eller-ingen");
        }
        return true;
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
      <Button type="submit" disabled={!isDirty}>
        {t("action.Lagre")}
      </Button>
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
