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
import { numberValidation, stringValidation } from "utils/validation";
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
    formState: { errors },
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
    previousValues.current = newValues;
    updateEditFeatureText(
      getRepresentasjonspunktId(stemmekretsId),
      newValues.stemmekretsnavn,
      newValues.stemmekretsnummer
    );

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
  };

  // TODO: denne kjøres bare når det gitte feltet valideres, ikke når det andre valideres
  const isTellekretsSynced = (lorem: string, ipsum: string) => {
    // Denne skal oppføre seg som en XNOR, enten har begge en lengde eller ingen av dem
    // TODO: bør kanskje kjøre trim før man sjekker lengde
    return !lorem.length === !ipsum.length;
  };

  const validationError = (error: FieldError | undefined) => {
    if (error) {
      return [
        {
          showError: error !== undefined,
          message: error.message,
        } as ValidationError,
      ];
    }
  };

  // TODO: mangler valgdistriktnummer?
  // TODO: translations
  // TODO: trekk valideringsfunksjoner (og kanskje alt av register-greier) ut av render-return
  return (
    <DetailsSection as="form" onSubmit={handleSubmit(saveAndAddHistoryEntry)}>
      <Input
        label={t("stemmekrets.Stemmekretsnummer")}
        {...register("stemmekretsnummer", {
          required: "Stemmekretsnummer kan ikke være tomt",
          validate: {
            isLessThanFiveFigures: (value) =>
              (stringValidation.isInteger(value) && value.length < 5) ||
              "Stemmekretsnummer må kun inneholde siffer (maks 4)",
            isPositive: (value) =>
              numberValidation.isPositive(parseInt(value)) ||
              "Stemmekretsnummer kan ikke være 0 eller et negativt tall",
            isUnique: () =>
              true ||
              "Stemmekretsnummer må være unik for den bestemte kommunen", // TODO: krever egen håndtering
          },
        })}
        validationError={validationError(errors.stemmekretsnummer)}
      />
      <Input
        label={t("tabell.Stemmekretsnavn")}
        {...register("stemmekretsnavn", {
          required: "Stemmekretsnavn kan ikke være tomt",
        })}
        validationError={validationError(errors.stemmekretsnavn)}
      />
      <Input
        label={t("stemmekrets.Tellekretsnummer")}
        {...register("tellekretsnummer", {
          validate: {
            isTellekretsValid: (value) =>
              isTellekretsSynced(value, getValues("tellekretsnavn")) ||
              "Må ha både navn og nummer for tellekrets, eller ingen av delene",
            isNumber: (value) =>
              isTellekretsSynced(value, getValues("tellekretsnavn")) ||
              stringValidation.isInteger(value) ||
              "Tellekretsnummer må være et tall",
            isPositive: (value) =>
              isTellekretsSynced(value, getValues("tellekretsnavn")) ||
              numberValidation.isPositive(parseInt(value)) ||
              "Tellekretsnummer kan ikke være 0 eller et negativt tall",
          },
        })}
        validationError={validationError(errors.tellekretsnummer)}
      />
      <Input
        label={t("stemmekrets.Tellekretsnavn")}
        {...register("tellekretsnavn", {
          validate: {
            isTellekretsValid: (value) =>
              isTellekretsSynced(value, getValues("tellekretsnummer")) ||
              "Må ha både navn og nummer for tellekrets, eller ingen av delene",
          },
        })}
        validationError={validationError(errors.tellekretsnavn)}
      />
      <Button type="submit">Lagre</Button>
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
