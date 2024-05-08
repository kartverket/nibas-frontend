import { MetadataEntry, HistoryDirection } from "contexts/HistoryContext/types";
import { useHistoryFormSync } from "contexts/HistoryContext/useHistoryFormSync";
import { Inndeling } from "contexts/InndelingerContext/InndelingerContext";
import { FieldError, RegisterOptions, UseFormReturn } from "react-hook-form";
import { MetadataResponse } from "types/api";
import { getNavnInSpraak } from "utils/language/language";
import { updateEditFeatureText } from "utils/map/layerStyles";
import { getRepresentasjonspunktId } from "utils/map/source";
import { capitalize } from "utils/string-utils";
import { isIntegerString } from "utils/type-utils";
import InputCell, { TableCell, MerknadCell } from "./KretsTableCells";
import { isKommuneInndeling, isStemmekretsInndeling } from "./useFlatedata";
import { getIdFromEntity } from "utils/api";
import { css, styled } from "styled-components";
import { FlatedataInputs } from "./flatedata-utils";
import { ValidationError } from "components/Input";

type Props = {
  inndeling: Inndeling;
  krets: MetadataResponse;
  isSearchMatch: boolean;
  isEditing: boolean;
  formMethods: UseFormReturn<FlatedataInputs>;
  previousValues: React.MutableRefObject<FlatedataInputs | undefined>;
};

const validationError = (error: FieldError | undefined | null) => {
  if (error) {
    return {
      showError: true,
      message: error.message,
    } as ValidationError;
  }
};

const KretsTableRow = ({ inndeling, krets, isSearchMatch, isEditing, formMethods, previousValues }: Props) => {
  const {
    setValue,
    getValues,
    register,
    formState: { errors },
  } = formMethods;

  const kretsId = getIdFromEntity(krets);
  const kretsErrors = errors[kretsId];
  const isAdministrativEnhet = inndeling.inndelingtype === "fylke" || inndeling.inndelingtype === "kommune";
  const kretsPrefix = isAdministrativEnhet ? "Kommune" : capitalize(inndeling.inndelingtype);

  const registerOptions: Record<string, RegisterOptions> = {
    nummer: {
      required: `${kretsPrefix}nummer kan ikke være tomt`,
      validate: (nummer: string) => {
        if (!isIntegerString(nummer) || nummer.length > 4 || parseInt(nummer) > 9999) {
          return `${kretsPrefix}nummer må kun inneholde siffer (maks 4)`;
        }
        if (parseInt(nummer) <= 0) {
          return `${kretsPrefix}nummer kan ikke være 0 eller et negativt tall`;
        }
        return true;
      },
    },
    navn: {
      required: `${kretsPrefix}navn kan ikke være tomt`,
    },
  };

  const setFormValues = (change: MetadataEntry["changes"][number], direction: HistoryDirection) => {
    const kretsChange = change[direction];
    if ("samiskforvaltningsomraade" in kretsChange) {
      setValue(`${kretsChange.lokalid}.samiskforvaltningsomraade`, kretsChange.samiskforvaltningsomraade);
    } else {
      setValue(`${kretsChange.identifikasjon.lokalid}.nummer`, kretsChange.nummer ?? "");
      setValue(`${kretsChange.identifikasjon.lokalid}.navn`, kretsChange.navn ?? "");
      updateEditFeatureText(
        getRepresentasjonspunktId(kretsChange.identifikasjon.lokalid),
        kretsChange.navn,
        kretsChange.nummer,
      );
    }
    previousValues.current = structuredClone(getValues());
  };

  useHistoryFormSync<MetadataEntry>({
    entityId: kretsId,
    redoEventKey: `${inndeling.inndelingtype}Redo`,
    undoEventKey: `${inndeling.inndelingtype}Undo`,
    setFormValues,
  });

  return (
    <Row key={kretsId} $isSearchMatch={isSearchMatch}>
      {isKommuneInndeling(krets) ? (
        <>
          <TableCell>{krets.nummer}</TableCell>
          <TableCell>{getNavnInSpraak(krets.navn, "nor")}</TableCell>
          <MerknadCell
            isEditing={isEditing}
            data={getValues(`${kretsId}.samiskforvaltningsomraade`) ?? krets.samiskforvaltningsomraade}
            validationError={
              kretsErrors && "samiskforvaltningsomraade" in kretsErrors
                ? validationError(kretsErrors.samiskforvaltningsomraade)
                : undefined
            }
            {...register(`${kretsId}.samiskforvaltningsomraade`)}
          />
        </>
      ) : (
        <>
          <InputCell
            isEditing={isEditing}
            data={getValues(`${kretsId}.nummer`) ?? krets.nummer}
            validationError={kretsErrors && "nummer" in kretsErrors ? validationError(kretsErrors.nummer) : undefined}
            {...register(`${kretsId}.nummer`, isStemmekretsInndeling(krets) ? registerOptions.nummer : undefined)}
          />
          <InputCell
            isEditing={isEditing}
            data={getValues(`${kretsId}.navn`) ?? krets.navn}
            validationError={kretsErrors && "navn" in kretsErrors ? validationError(kretsErrors.navn) : undefined}
            {...register(`${kretsId}.navn`, isStemmekretsInndeling(krets) ? registerOptions.navn : undefined)}
          />
          <TableCell>{isStemmekretsInndeling(krets) ? krets.valgdistriktsnummer ?? "" : ""}</TableCell>
        </>
      )}
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

export default KretsTableRow;
