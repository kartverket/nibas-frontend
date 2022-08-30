import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import Input from "components/form/Input";
import { StemmekretsEntry, useToolbarSave } from "contexts/ToolbarContext";
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

  const { register, setValue, getValues } = useForm<Inputs>();

  const { addEntry } = useToolbarSave("grunnkrets");

  const previousValues = useRef<Inputs>(getValues());

  useEffect(() => {
    if (!fullStemmekrets) return;

    setValue("stemmekretsnavn", fullStemmekrets.stemmekretsnavn);
    setValue("stemmekretsnummer", fullStemmekrets.stemmekretsnummer);
    setValue("tellekretsnavn", fullStemmekrets.tellekretsnavn ?? "");
    setValue("tellekretsnummer", fullStemmekrets.tellekretsnummer ?? "");

    previousValues.current = getValues();
  }, [fullStemmekrets, setValue, getValues]);

  useEffect(() => {
    const undoGrunnkrets = ((e: CustomEvent) => {
      const entry = e.detail.entry as StemmekretsEntry;

      const changeForThisId = entry.changes.find(
        (change) => change.id === fullStemmekrets?.id
      );

      if (!changeForThisId) return;

      setValue("stemmekretsnavn", changeForThisId.from.stemmekretsnavn ?? "");
      setValue(
        "stemmekretsnummer",
        changeForThisId.from.stemmekretsnummer ?? ""
      );
      setValue("tellekretsnavn", changeForThisId.from.tellekretsnavn ?? "");
      setValue("tellekretsnummer", changeForThisId.from.tellekretsnummer ?? "");
    }) as EventListener;

    document.addEventListener("stemmekretsUndo", undoGrunnkrets);

    return () => {
      document.removeEventListener("stemmekretsUndo", undoGrunnkrets);
    };
  }, [fullStemmekrets?.id, setValue]);

  useEffect(() => {
    const redoGrunnkrets = ((e: CustomEvent) => {
      const entry = e.detail.entry as StemmekretsEntry;

      const changeForThisId = entry.changes.find(
        (change) => change.id === fullStemmekrets?.id
      );

      if (!changeForThisId || !changeForThisId.to) return;

      setValue("stemmekretsnavn", changeForThisId.to.stemmekretsnavn ?? "");
      setValue("stemmekretsnummer", changeForThisId.to.stemmekretsnummer ?? "");
      setValue("tellekretsnavn", changeForThisId.to.tellekretsnavn ?? "");
      setValue("tellekretsnummer", changeForThisId.to.tellekretsnummer ?? "");
    }) as EventListener;

    document.addEventListener("stemmekretsRedo", redoGrunnkrets);

    return () => {
      document.removeEventListener("stemmekretsRedo", redoGrunnkrets);
    };
  }, [fullStemmekrets?.id, setValue]);

  const addStemmekretsEntry = () => {
    if (!fullStemmekrets) return;

    addEntry({
      type: "stemmekrets",
      kommuneId,
      changes: [
        {
          from: fromFormToRequest(previousValues.current, fullStemmekrets),
          to: fromFormToRequest(getValues(), fullStemmekrets),
          id: fullStemmekrets.id,
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
  margin: auto;

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
