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
import useTimer from "hooks/useTimer";
import { getIdFromEntity } from "utils/api";

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
  identifikasjon: {
    lokalid: getIdFromEntity(grunnkrets),
  },
  version: grunnkrets.version,
  navn: data.navn,
  grunnkretsnummer: data.grunnkretsnummer,
});

const EditRow = ({ grunnkrets, kommuneId }: Props) => {
  const grunnkretsId = getIdFromEntity(grunnkrets);
  const { t } = useTranslation();
  const { data: fullGrunnkrets } = useNibasApi("/v1/grunnkretser/{id}", {
    id: grunnkretsId,
  });
  const { startTimer, clearTimer } = useTimer();

  const { register, getValues, setValue } = useForm<Inputs>({
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
    entityId: grunnkretsId,
    redoEventKey: "grunnkretsRedo",
    undoEventKey: "grunnkretsUndo",
    setFormValues,
  });

  const onChange = () => {
    clearTimer();

    if (!fullGrunnkrets) return;

    startTimer(
      () =>
        addEntry({
          type: "grunnkrets",
          kommuneId,
          changes: [
            {
              from: fromFormToRequest(previousValues.current, fullGrunnkrets),
              to: fromFormToRequest(getValues(), fullGrunnkrets),
              id: grunnkretsId,
            },
          ],
        }),
      700
    );

    previousValues.current = getValues();
  };

  const registerOptions = {
    onChange,
  };

  return (
    <AccordionRow>
      <td>
        <BlockLabel>
          {t("grunnkrets.Grunnkretsnavn")}
          <Input {...register("navn", registerOptions)} />
        </BlockLabel>
      </td>
      <td>
        <BlockLabel>
          {t("grunnkrets.Grunnkretsnummer")}
          <Input {...register("grunnkretsnummer", registerOptions)} />
        </BlockLabel>
      </td>
      <td colSpan={2} />
    </AccordionRow>
  );
};

const AccordionRow = styled.tr`
  background-color: var(--gray_light);

  td {
    padding: 16px;
  }
`;

const BlockLabel = styled(Label)`
  color: var(--gray_dark);

  input {
    width: 100%;
  }

  margin-bottom: 16px;
`;

export default EditRow;
