import { HistoryDirection, MetadataEntry } from "contexts/HistoryContext/types";
import { useHistoryFormSync } from "contexts/HistoryContext/useHistoryFormSync";
import { Fragment } from "react";
import { Control, UseFormReturn, useFormState } from "react-hook-form";
import { css, styled } from "styled-components";
import { MetadataResponse } from "types/api";
import { getIdFromEntity } from "utils/api";
import { getInndelingFremtidigEndringDato } from "utils/features";
import { FlatedataInputs } from "./flatedata-utils";
import { FlatedataColumn, InndelingErrors } from "./FlatedatColumns";
import type { FlatedataTableInndelingtype } from "./FlatedataPanel";

type Props = {
  inndelingtype: FlatedataTableInndelingtype;
  inndeling: MetadataResponse;
  columns: FlatedataColumn[];
  isSearchMatch: boolean;
  isEditing: boolean;
  formMethods: UseFormReturn<FlatedataInputs>;
  setPreviousValues: (flatedata: FlatedataInputs | undefined) => void;
  allInndelinger: MetadataResponse[];
  sammenslaaingInformasjon: string | undefined;
  control: Control<FlatedataInputs>;
};

export const FlatedataTableRow = ({
  inndelingtype,
  inndeling,
  columns,
  isSearchMatch,
  isEditing,
  formMethods,
  setPreviousValues,
  allInndelinger,
  sammenslaaingInformasjon,
  control,
}: Props) => {
  const { setValue, getValues } = formMethods;
  const inndelingId = getIdFromEntity(inndeling);
  const { errors } = useFormState({ control });
  const inndelingErrors = errors?.[inndelingId] as InndelingErrors;

  // Ved undo og redo må grensesnittet oppdateres med riktig informasjon
  const setFormValues = (change: MetadataEntry["changes"][number], direction: HistoryDirection) => {
    const inndelingChange = change[direction];
    if ("samiskforvaltningsomraade" in inndelingChange) {
      setValue(`${inndelingChange.lokalid}.samiskforvaltningsomraade`, inndelingChange.samiskforvaltningsomraade);
    } else {
      setValue(`${inndelingChange.identifikasjon.lokalid}.nummer`, inndelingChange.nummer ?? "");
      setValue(`${inndelingChange.identifikasjon.lokalid}.navn`, inndelingChange.navn ?? "");
    }
    setPreviousValues(structuredClone(getValues()));
  };

  // Dersom representasjonspunktet til en inndeling har en gyldigTil dato vet vi at inndelingen har en fremtidig endring på seg, enten denne er geometri eller metadata
  // Ettersom vi ikke vet hvilket lag vi er i kontekst av så sjekker vi bare alle alg
  const disabledDate = getInndelingFremtidigEndringDato(inndelingId);

  useHistoryFormSync<MetadataEntry>({
    entityId: inndelingId,
    redoEventKey: `${inndelingtype}Redo`,
    undoEventKey: `${inndelingtype}Undo`,
    setFormValues,
  });

  const ctx = {
    inndeling,
    inndelingId,
    inndelingtype,
    isEditing,
    disabledDate,
    formMethods,
    control,
    inndelingErrors,
    allInndelinger,
    sammenslaaingInformasjon,
  };

  return (
    <Row key={inndelingId} $isSearchMatch={isSearchMatch}>
      {columns.map((c, i) => (
        <Fragment key={i}>{c.renderCell(ctx)}</Fragment>
      ))}
    </Row>
  );
};

const Row = styled.tr<{ $isSearchMatch: boolean }>`
  ${(props) =>
    !props.$isSearchMatch &&
    css`
      display: none !important;
    `};
`;
