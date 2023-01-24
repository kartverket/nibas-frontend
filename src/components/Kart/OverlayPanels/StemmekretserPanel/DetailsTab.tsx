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
import { BlockLabel, Section } from "./components";
import { editSource } from "hooks/layers/constants";
import { getRepresentasjonspunktId } from "utils/map/source";

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
      setValue("stemmekretsnavn", change[direction]?.stemmekretsnavn ?? "");
      setValue("stemmekretsnummer", change[direction]?.stemmekretsnummer ?? "");
      setValue("tellekretsnavn", change[direction]?.tellekretsnavn ?? "");
      setValue("tellekretsnummer", change[direction]?.tellekretsnummer ?? "");
    },
    [setValue]
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
      const feature = editSource.getFeatureById(
        getRepresentasjonspunktId(stemmekretsId)
      );
      feature.set("name", newValues.stemmekretsnavn);
      feature.set("number", newValues.stemmekretsnummer);
    }, 700);
  };

  const formOptions = {
    onChange,
  };

  return (
    <DetailsSection>
      <BlockLabel>
        {t("stemmekrets.Stemmekretsnummer")}
        <Input {...register("stemmekretsnummer", formOptions)} />
      </BlockLabel>

      <BlockLabel>
        {t("tabell.Stemmekretsnavn")}
        <Input {...register("stemmekretsnavn", formOptions)} />
      </BlockLabel>

      <BlockLabel>
        {t("stemmekrets.Tellekretsnummer")}
        <Input {...register("tellekretsnummer", formOptions)} />
      </BlockLabel>

      <BlockLabel>
        {t("stemmekrets.Tellekretsnavn")}
        <Input {...register("tellekretsnavn", formOptions)} />
      </BlockLabel>
    </DetailsSection>
  );
};

const DetailsSection = styled(Section)`
  display: flex;
  gap: 16px;
  color: var(--gray_dark);

  ${BlockLabel}:nth-child(1) {
    width: 165px;
  }
  ${BlockLabel}:nth-child(2) {
    width: 160px;
  }
  ${BlockLabel}:nth-child(3) {
    width: 130px;
  }
  ${BlockLabel}:nth-child(4) {
    width: 150px;
  }
`;

export default DetailsTab;
