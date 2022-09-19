import { useCallback, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import Input from "components/form/Input";
import { StemmekretsEntry, useToolbarSave } from "contexts/ToolbarContext";
import useKretsToolbarSync from "contexts/ToolbarContext/useKretsToolbarSync";
import { useUtkastEntity } from "contexts/UtkastContext";
import useNibasApi from "hooks/useNibasApi";
import {
  StemmekretsRef,
  StemmekretsRequest,
  StemmekretsResponse,
} from "types/api";

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
  identifikasjon: stemmekrets.identifikasjon,
  valgdistriktsnummer: stemmekrets.valgdistriktsnummer,
  stemmekretsnavn: data.stemmekretsnavn,
  stemmekretsnummer: data.stemmekretsnummer,
  tellekretsnavn: data.tellekretsnavn,
  tellekretsnummer: data.tellekretsnummer,
});

type Props = {
  stemmekrets: StemmekretsRef;
  kommuneId: string;
};

const EditRow = ({ stemmekrets, kommuneId }: Props) => {
  const { t } = useTranslation();
  const { data: fullStemmekrets } = useNibasApi("/v1/stemmekretser/{id}", {
    id: stemmekrets.id,
  });

  const utkastStemmekrets = useUtkastEntity(
    fullStemmekrets,
    "stemmekretsendringer"
  ) as StemmekretsResponse | undefined;

  const { register, setValue, getValues } = useForm<Inputs>();

  const { addEntry } = useToolbarSave();

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
    kretsId: utkastStemmekrets?.id,
    redoEventKey: "stemmekretsRedo",
    undoEventKey: "stemmekretsUndo",
    setFormValues,
  });

  const addStemmekretsEntry = () => {
    if (!utkastStemmekrets) return;

    addEntry({
      type: "stemmekrets",
      kommuneId,
      changes: [
        {
          from: fromFormToRequest(previousValues.current, utkastStemmekrets),
          to: fromFormToRequest(getValues(), utkastStemmekrets),
          id: utkastStemmekrets.id,
        },
      ],
    });

    previousValues.current = getValues();
  };

  const formOptions = {
    onBlur: addStemmekretsEntry,
  };

  return (
    <AccordionRow>
      <td colSpan={6}>
        <InputsWrapper>
          <BlockLabel>
            {t("stemmekrets.Stemmekretsnummer")}
            <Input {...register("stemmekretsnummer", formOptions)} />
          </BlockLabel>

          <BlockLabel>
            {t("tabell.Navn")}
            <Input {...register("stemmekretsnavn", formOptions)} />
          </BlockLabel>
        </InputsWrapper>

        <InputsWrapper>
          <BlockLabel>
            {t("stemmekrets.Tellekretsnummer")}
            <Input {...register("tellekretsnummer", formOptions)} />
          </BlockLabel>

          <BlockLabel>
            {t("stemmekrets.Tellekretsnavn")}
            <Input {...register("tellekretsnavn", formOptions)} />
          </BlockLabel>
        </InputsWrapper>
      </td>
    </AccordionRow>
  );
};

const AccordionRow = styled.tr`
  background-color: ${({ theme }) => theme.colors.blueLight};

  td {
    padding: 8px;
  }
`;

const BlockLabel = styled.label`
  &:last-child {
    margin-left: 16px;
  }

  input {
    width: 100%;
  }

  margin-bottom: 16px;
`;

const InputsWrapper = styled.div`
  display: flex;
  width: 80%;

  > ${BlockLabel} {
    width: 100%;

    &:first-child {
      flex: 1;
    }

    &:last-child {
      flex: 3;
    }
  }
`;

export default EditRow;
