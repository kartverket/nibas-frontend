import { useCallback, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import Input from "components/form/Input";
import { StemmekretsEntry, useToolbarSaving } from "contexts/ToolbarContext";
import useKretsToolbarSync from "contexts/ToolbarContext/useToolbarFormSync";
import { StemmekretsRequest, StemmekretsResponse } from "types/api";
import useTimer from "hooks/useTimer";
import { getIdFromEntity } from "utils/api";
import styled from "styled-components";
import { Section } from "./components";
import { getRepresentasjonspunktId } from "utils/map/source";
import { updateEditFeatureText } from "utils/map/layerStyles";
import { numberValidation, stringValidation } from "utils/validation";

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

  const { startTimer, clearTimer } = useTimer();

  const { register, setValue, getValues } = useForm<Inputs>();

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

  const onChange = () => {
    clearTimer();

    if (!utkastStemmekrets) return;

    startTimer(() => {
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
    }, 700);
  };

  const formOptions = {
    onChange,
  };

  return (
    <DetailsSection>
      <Input
        label={t("stemmekrets.Stemmekretsnummer")}
        {...register("stemmekretsnummer", { ...formOptions })}
        validationError={[
          {
            message: "Stemmekretsnummer kan ikke være tomt",
            showError: stringValidation.isEmpty(getValues().stemmekretsnummer),
          },
          {
            message: "Stemmekretsnummer må kun inneholde siffer (maks 4)",
            showError:
              stringValidation.isInteger(getValues().stemmekretsnummer) &&
              parseInt(getValues().stemmekretsnummer) <= 9999,
          },
          {
            message: "Stemmekretsnummer kan ikke være 0 eller et negativt tall",
            showError: !numberValidation.isPositive(
              parseInt(getValues().stemmekretsnummer)
            ),
          },
          {
            message: "Stemmekretsnummer må være unik for den bestemte kommunen",
            showError: false, // TODO: krever egen håndtering
          },
        ]}
      />
      <Input
        label={t("tabell.Stemmekretsnavn")}
        {...register("stemmekretsnavn", formOptions)}
        validationError={[
          {
            message: "Stemmekretsnavn kan ikke være tomt",
            showError: stringValidation.isEmpty(getValues().stemmekretsnavn),
          },
        ]}
      />
      <Input
        label={t("stemmekrets.Tellekretsnummer")}
        {...register("tellekretsnummer", formOptions)}
        validationError={[
          {
            message:
              "Må ha både navn og nummer for tellekrets, eller ingen av delene",
            showError:
              !stringValidation.isEmpty(getValues().tellekretsnummer) &&
              stringValidation.isEmpty(getValues().tellekretsnavn),
          },
          {
            message: "Tellekretsnummer må være et tall",
            showError: stringValidation.isInteger(getValues().tellekretsnummer),
          },
          {
            message: "Tellekretsnummer kan ikke være 0 eller et negativt tall",
            showError: !numberValidation.isPositive(
              parseInt(getValues().tellekretsnummer)
            ),
          },
        ]}
      />
      <Input
        label={t("stemmekrets.Tellekretsnavn")}
        {...register("tellekretsnavn", formOptions)}
        validationError={[
          {
            message:
              "Må ha både navn og nummer for tellekrets, eller ingen av delene",
            showError:
              stringValidation.isEmpty(getValues().tellekretsnummer) &&
              !stringValidation.isEmpty(getValues().tellekretsnavn),
          },
        ]}
      />
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
