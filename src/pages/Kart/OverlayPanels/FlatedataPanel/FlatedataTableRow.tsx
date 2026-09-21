import { HistoryDirection, MetadataEntry } from "contexts/HistoryContext/types";
import { useHistoryFormSync } from "contexts/HistoryContext/useHistoryFormSync";
import { Fragment } from "react";
import { Control, UseFormReturn, useFormState } from "react-hook-form";
import { css, keyframes, styled } from "styled-components";
import { MetadataResponse } from "types/api";
import { getIdFromEntity } from "utils/api";
import { getInndelingFremtidigEndringDato } from "utils/features";
import { FlatedataInputs } from "./flatedata-utils";
import { FlatedataColumn, FlatedataColumnCtx, InndelingErrors } from "./FlatedatColumns";
import type { FlatedataTableInndelingtype } from "./FlatedataPanel";
import { useHistory } from "contexts/HistoryContext/HistoryContext";
import { useUtkast } from "contexts/UtkastContext/UtkastContext";
import { inndelingIsArchived } from "pages/Kart/interactions/archive-features";

type Props = {
  inndelingtype: FlatedataTableInndelingtype;
  inndeling: MetadataResponse;
  kommuneLokalid: string;
  columns: FlatedataColumn[];
  isSearchMatch: boolean;
  isEditing: boolean;
  isNew: boolean;
  formMethods: UseFormReturn<FlatedataInputs>;
  setPreviousValues: (flatedata: FlatedataInputs | undefined) => void;
  allInndelinger: MetadataResponse[];
  sammenslaaingInformasjon: string | undefined;
  control: Control<FlatedataInputs>;
  canEditInndeling: boolean;
};

export const FlatedataTableRow = ({
  inndelingtype,
  inndeling,
  kommuneLokalid,
  columns,
  isSearchMatch,
  isEditing,
  isNew,
  formMethods,
  setPreviousValues,
  allInndelinger,
  sammenslaaingInformasjon,
  control,
  canEditInndeling,
}: Props) => {
  const { setValue, getValues } = formMethods;
  const inndelingId = getIdFromEntity(inndeling);
  const { errors } = useFormState({ control });
  const inndelingErrors = errors?.[inndelingId] as InndelingErrors;
  const { utkast } = useUtkast();
  const { getHistoryEntries } = useHistory();

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

  const isInndelingArchivedInUtkast = inndelingIsArchived(inndelingId, utkast, getHistoryEntries());
  // Dersom representasjonspunktet til en inndeling har en gyldigTil dato vet vi at inndelingen har en fremtidig endring på seg, enten denne er geometri eller metadata
  // Ettersom vi ikke vet hvilket lag vi er i kontekst av så sjekker vi bare alle alg
  const disabledByFremtidigEndringUntilDate = getInndelingFremtidigEndringDato(inndelingId);

  useHistoryFormSync<MetadataEntry>({
    entityId: inndelingId,
    redoEventKey: `${inndelingtype}Redo`,
    undoEventKey: `${inndelingtype}Undo`,
    setFormValues,
  });

  const ctx: FlatedataColumnCtx = {
    inndeling,
    inndelingId,
    inndelingtype,
    isEditing: isEditing && !isInndelingArchivedInUtkast,
    disabledDate: disabledByFremtidigEndringUntilDate,
    isArchived: isInndelingArchivedInUtkast,
    formMethods,
    control,
    inndelingErrors,
    allInndelinger,
    sammenslaaingInformasjon,
    canEditInndeling,
  };

  return (
    <Row
      key={inndelingId}
      $isSearchMatch={isSearchMatch}
      $isNew={isNew && isEditing}
      $isDisabled={isInndelingArchivedInUtkast}
    >
      {columns.map((c, i) => (
        <Fragment key={i}>{c.renderCell(ctx)}</Fragment>
      ))}
    </Row>
  );
};

const Row = styled.tr<{ $isSearchMatch: boolean; $isNew: boolean; $isDisabled: boolean }>`
  ${(props) =>
    !props.$isSearchMatch &&
    css`
      display: none !important;
    `};

  ${(props) =>
    props.$isNew &&
    css`
      td {
        animation: ${fadeFromBlue} 1.5s ease-out forwards;
      }

      td input,
      td select,
      td textarea {
        background-color: white;
      }
    `};

  ${(props) =>
    props.$isDisabled &&
    css`
      td {
        background-color: var(--kvib-colors-gray-100);
      }

      td:not(.archive-action-cell) > * {
        color: var(--kvib-colors-gray-500);
        filter: grayscale(1);
        opacity: 0.75;
      }

      .flatedata-badge {
        background-color: var(--kvib-colors-gray-200);
        color: var(--kvib-colors-gray-500);
      }
    `};
`;

const fadeFromBlue = keyframes`
  from {
    background-color: var(--kvib-colors-blue-50, #ebf8ff);
  }
  to {
    background-color: transparent;
  }
`;
