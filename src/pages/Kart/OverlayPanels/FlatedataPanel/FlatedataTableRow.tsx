import { MetadataEntry, HistoryDirection } from "contexts/HistoryContext/types";
import { useHistoryFormSync } from "contexts/HistoryContext/useHistoryFormSync";
import { Inndelingtype } from "contexts/InndelingerContext/InndelingerContext";
import { FieldError, RegisterOptions, UseFormReturn } from "react-hook-form";
import { MetadataResponse } from "types/api";
import { getNavnInSpraak } from "utils/language/language";
import { updateRepresentasjonspunkt } from "utils/map/layerStyles";
import { capitalize } from "utils/string-utils";
import { isIntegerString } from "utils/type-utils";
import InputCell, { TableCell, MerknadCell } from "./FlatedataTableCells";
import { isKommuneInndeling, isStemmekretsInndeling } from "./useFlatedata";
import { getIdFromEntity } from "utils/api";
import { css, styled } from "styled-components";
import { FlatedataInputs } from "./flatedata-utils";
import { ValidationError } from "components/Input";

type Props = {
  inndelingtype: Inndelingtype;
  inndeling: MetadataResponse;
  isSearchMatch: boolean;
  isEditing: boolean;
  formMethods: UseFormReturn<FlatedataInputs>;
  previousValues: React.MutableRefObject<FlatedataInputs | undefined>;
};

const FlatedataTableRow = ({
  inndelingtype,
  inndeling,
  isSearchMatch,
  isEditing,
  formMethods,
  previousValues,
}: Props) => {
  const {
    setValue,
    getValues,
    register,
    formState: { errors },
  } = formMethods;

  const inndelingId = getIdFromEntity(inndeling);
  const inndelingErrors = errors[inndelingId];
  const registerOptions = getRegisterOptions(inndelingtype);

  // Ved undo og redo må grensesnittet oppdateres med riktig informasjon
  const setFormValues = (change: MetadataEntry["changes"][number], direction: HistoryDirection) => {
    const inndelingChange = change[direction];
    if ("samiskforvaltningsomraade" in inndelingChange) {
      setValue(`${inndelingChange.lokalid}.samiskforvaltningsomraade`, inndelingChange.samiskforvaltningsomraade);
    } else {
      setValue(`${inndelingChange.identifikasjon.lokalid}.nummer`, inndelingChange.nummer ?? "");
      setValue(`${inndelingChange.identifikasjon.lokalid}.navn`, inndelingChange.navn ?? "");
      updateRepresentasjonspunkt(inndelingChange.identifikasjon.lokalid, inndelingChange.nummer, inndelingChange.navn);
    }
    previousValues.current = structuredClone(getValues());
  };

  useHistoryFormSync<MetadataEntry>({
    entityId: inndelingId,
    redoEventKey: `${inndelingtype}Redo`,
    undoEventKey: `${inndelingtype}Undo`,
    setFormValues,
  });

  return (
    <Row key={inndelingId} $isSearchMatch={isSearchMatch}>
      {isKommuneInndeling(inndeling) ? (
        <>
          <TableCell>{inndeling.nummer}</TableCell>
          <TableCell>{getNavnInSpraak(inndeling.navn, "nor")}</TableCell>
          <MerknadCell
            isEditing={isEditing}
            data={getValues(`${inndelingId}.samiskforvaltningsomraade`) ?? inndeling.samiskforvaltningsomraade}
            validationError={
              inndelingErrors && "samiskforvaltningsomraade" in inndelingErrors
                ? validationError(inndelingErrors.samiskforvaltningsomraade)
                : undefined
            }
            {...register(`${inndelingId}.samiskforvaltningsomraade`)}
          />
        </>
      ) : (
        <>
          <InputCell
            isEditing={isEditing}
            data={getValues(`${inndelingId}.nummer`) ?? inndeling.nummer}
            validationError={
              inndelingErrors && "nummer" in inndelingErrors ? validationError(inndelingErrors.nummer) : undefined
            }
            {...register(
              `${inndelingId}.nummer`,
              isStemmekretsInndeling(inndeling) ? registerOptions.nummer : undefined,
            )}
          />
          <InputCell
            isEditing={isEditing}
            data={getValues(`${inndelingId}.navn`) ?? inndeling.navn}
            validationError={
              inndelingErrors && "navn" in inndelingErrors ? validationError(inndelingErrors.navn) : undefined
            }
            {...register(`${inndelingId}.navn`, isStemmekretsInndeling(inndeling) ? registerOptions.navn : undefined)}
          />
          <TableCell>{isStemmekretsInndeling(inndeling) ? inndeling.valgdistriktsnummer ?? "" : ""}</TableCell>
        </>
      )}
    </Row>
  );
};

const validationError = (error: FieldError | undefined | null) => {
  if (error) {
    return {
      showError: true,
      message: error.message,
    } as ValidationError;
  }
};

const getRegisterOptions = (inndelingtype: Inndelingtype): Record<string, RegisterOptions> => {
  const inndelingPrefix = inndelingtype === "fylke" ? "Kommune" : capitalize(inndelingtype);
  return {
    nummer: {
      required: `${inndelingPrefix}nummer kan ikke være tomt`,
      validate: (nummer: string) => {
        if (!isIntegerString(nummer) || nummer.length > 4 || parseInt(nummer) > 9999) {
          return `${inndelingPrefix}nummer må kun inneholde siffer (maks 4)`;
        }
        if (parseInt(nummer) <= 0) {
          return `${inndelingPrefix}nummer kan ikke være 0 eller et negativt tall`;
        }
        return true;
      },
    },
    navn: {
      required: `${inndelingPrefix}navn kan ikke være tomt`,
    },
  };
};

const Row = styled.tr<{ $isSearchMatch: boolean }>`
  ${(props) =>
    !props.$isSearchMatch &&
    css`
      display: none !important;
    `};
`;

export default FlatedataTableRow;
