import { useCallback, useRef } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import Input from "components/form/Input";
import Label from "components/form/Label";
import { GrunnkretsEntry, useToolbarSaving } from "contexts/ToolbarContext";
import useKretsToolbarSync from "contexts/ToolbarContext/useToolbarFormSync";
import useNibasApi from "hooks/useNibasApi";
import {
  GrunnkretsRef,
  GrunnkretsRequest,
  GrunnkretsResponse,
} from "types/api";
import { getNavnInSpraak } from "utils/language/language";
import get from "lodash.get";

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
  version: grunnkrets.version,
  navn: data.navn,
  grunnkretsnummer: data.grunnkretsnummer,
});

const EditRow = ({ grunnkrets, kommuneId }: Props) => {
  const { t } = useTranslation();
  const { data: fullGrunnkrets } = useNibasApi("/v1/grunnkretser/{id}", {
    id: grunnkrets.id,
  });

  const {
    register,
    getValues,
    setValue,
    formState: { dirtyFields },
  } = useForm<Inputs>({
    defaultValues: {
      grunnkretsnummer: grunnkrets.grunnkretsnummer,
      navn: getNavnInSpraak(grunnkrets.navn, "nor"),
    },
  });

  const previousValues = useRef<Inputs>(getValues());

  const { addEntry } = useToolbarSaving();

  const setFormValues = useCallback(
    (change: GrunnkretsEntry["changes"][number], direction: "to" | "from") => {
      setValue("grunnkretsnummer", change[direction]?.grunnkretsnummer ?? "");
      setValue("navn", change[direction]?.navn ?? "");
    },
    [setValue]
  );

  useKretsToolbarSync<GrunnkretsEntry>({
    entityId: fullGrunnkrets?.id,
    redoEventKey: "grunnkretsRedo",
    undoEventKey: "grunnkretsUndo",
    setFormValues,
  });

  const onBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    if (!fullGrunnkrets) return;

    const isDirty = get(dirtyFields, e.target.name);

    if (!isDirty) return;

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
    onBlur,
  };

  return (
    <AccordionRow>
      <td colSpan={4}>
        <InputsWrapper>
          <BlockLabel>
            {t("tabell.Navn")}
            <Input {...register("navn", registerOptions)} />
          </BlockLabel>
          <BlockLabel>
            {t("grunnkrets.Grunnkretsnummer")}
            <Input {...register("grunnkretsnummer", registerOptions)} />
          </BlockLabel>
        </InputsWrapper>
      </td>
    </AccordionRow>
  );
};

const AccordionRow = styled.tr`
  background-color: var(--blue_light);

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

  > ${BlockLabel} {
    width: 100%;

    &:first-child {
      flex: 2;
    }

    &:last-child {
      flex: 1;
    }
  }
`;

export default EditRow;
