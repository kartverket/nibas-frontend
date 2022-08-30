import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import Input from "components/form/Input";
import Label from "components/form/Label";
import { GrunnkretsEntry, useToolbarSave } from "contexts/ToolbarContext";
import useNibasApi from "hooks/useNibasApi";
import {
  GrunnkretsRef,
  GrunnkretsRequest,
  GrunnkretsResponse,
} from "types/api";
import { getNavnInSpraak } from "utils/language/language";

type Props = {
  grunnkrets: GrunnkretsRef;
  kommuneId: string;
};

type Inputs = {
  navn: string;
  grunnkretsnummer: string;
};

const fromFormToRequest = (
  data: Inputs,
  grunnkrets: GrunnkretsResponse
): GrunnkretsRequest => ({
  identifikasjon: grunnkrets.identifikasjon,
  navn: data.navn,
  grunnkretsnummer: data.grunnkretsnummer,
});

const EditRow = ({ grunnkrets, kommuneId }: Props) => {
  const { t } = useTranslation();
  const { data: fullGrunnkrets } = useNibasApi("/v1/grunnkretser/{id}", {
    id: grunnkrets.id,
  });

  const { register, getValues, setValue } = useForm<Inputs>({
    defaultValues: {
      grunnkretsnummer: grunnkrets.grunnkretsnummer,
      navn: getNavnInSpraak(grunnkrets.navn, "nor"),
    },
  });

  const previousValues = useRef<Inputs>(getValues());

  const { addEntry } = useToolbarSave("grunnkrets");

  useEffect(() => {
    const undoGrunnkrets = ((e: CustomEvent) => {
      const entry = e.detail.entry as GrunnkretsEntry;

      const changeForThisId = entry.changes.find(
        (change) => change.id === fullGrunnkrets?.id
      );

      if (!changeForThisId) return;

      setValue("grunnkretsnummer", changeForThisId.from.grunnkretsnummer);
      setValue("navn", changeForThisId.from.navn);
    }) as EventListener;

    document.addEventListener("grunnkretsUndo", undoGrunnkrets);

    return () => {
      document.removeEventListener("grunnkretsUndo", undoGrunnkrets);
    };
  }, [fullGrunnkrets?.id, setValue]);

  useEffect(() => {
    const redoGrunnkrets = ((e: CustomEvent) => {
      const entry = e.detail.entry as GrunnkretsEntry;

      const changeForThisId = entry.changes.find(
        (change) => change.id === fullGrunnkrets?.id
      );

      if (!changeForThisId || !changeForThisId.to) return;

      setValue("grunnkretsnummer", changeForThisId.to.grunnkretsnummer);
      setValue("navn", changeForThisId.to.navn);
    }) as EventListener;

    document.addEventListener("grunnkretsRedo", redoGrunnkrets);

    return () => {
      document.removeEventListener("grunnkretsRedo", redoGrunnkrets);
    };
  }, [fullGrunnkrets?.id, setValue]);

  const addGrunnkretsEntry = () => {
    if (!fullGrunnkrets) return;

    addEntry({
      type: "grunnkrets",
      kommuneId,
      changes: [
        {
          from: fromFormToRequest(previousValues.current, fullGrunnkrets),
          to: fromFormToRequest(getValues(), fullGrunnkrets),
          id: fullGrunnkrets.id,
        },
      ],
    });

    previousValues.current = getValues();
  };

  const registerOptions = {
    onBlur: addGrunnkretsEntry,
  };

  return (
    <AccordionRow>
      <td colSpan={3}>
        <InputsWrapper>
          <BlockLabel>
            {t("grunnkrets.Grunnkretsnummer")}
            <Input {...register("grunnkretsnummer", registerOptions)} />
          </BlockLabel>
          <BlockLabel>
            {t("tabell.Navn")}
            <Input {...register("navn", registerOptions)} />
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

const BlockLabel = styled(Label)`
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
