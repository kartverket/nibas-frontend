import { MetadataEntry, HistoryDirection } from "contexts/HistoryContext/types";
import { useHistoryFormSync } from "contexts/HistoryContext/useHistoryFormSync";
import { Inndelingtype } from "contexts/InndelingerContext/InndelingerContext";
import { FieldError, UseFormReturn } from "react-hook-form";
import { MetadataResponse } from "types/api";
import { getNavnInSpraak } from "utils/language/language";
import { capitalize } from "utils/string-utils";
import InputCell, { TableCell, MerknadCell } from "./FlatedataTableCells";
import { isKommuneInndeling, isStemmekretsInndeling } from "./useFlatedata";
import { getIdFromEntity } from "utils/api";
import { css, styled } from "styled-components";
import { FlatedataInputs } from "./flatedata-utils";
import { ValidationError } from "components/Input";
import { getInndelingFremtidigEndringDato } from "utils/features";
import { Icon, Tooltip } from "@kvib/react";
import { datestringToFormattedDatestring } from "../GrenseinformasjonPanel/grenseinformasjon-utils";
import { getNumberValidatorFunctionForInndelingType } from "utils/inndelinger-utils";

type FremtidigEndringIconProps = {
  formattedDate: string | undefined;
};

const FremtidigEndringIcon = ({ formattedDate }: FremtidigEndringIconProps) => {
  return (
    formattedDate != null && (
      <Tooltip
        label={`Inndelingen har en fremtidig endring og kan ikke endres før endringen inntreffer. Endringer inntreffer ${formattedDate}`}
        placement="left"
        hasArrow
      >
        <IconContainer>
          <Icon
            color="var(--kvib-colors-blue-500)"
            aria-label="Inndelingen har fremtidig endring"
            icon="lock_clock"
          ></Icon>
        </IconContainer>
      </Tooltip>
    )
  );
};

const IconContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;

type Props = {
  inndelingtype: Inndelingtype;
  inndeling: MetadataResponse;
  isSearchMatch: boolean;
  isEditing: boolean;
  formMethods: UseFormReturn<FlatedataInputs>;
  previousValues: React.MutableRefObject<FlatedataInputs | undefined>;
  allInndelinger: MetadataResponse[];
};

export const FlatedataTableRow = ({
  inndelingtype,
  inndeling,
  isSearchMatch,
  isEditing,
  formMethods,
  previousValues,
  allInndelinger,
}: Props) => {
  const {
    setValue,
    getValues,
    register,
    formState: { errors },
  } = formMethods;

  const inndelingId = getIdFromEntity(inndeling);
  const inndelingErrors = errors[inndelingId];

  const existingInndelingtypeNumbers = allInndelinger
    .filter((item) => item.id !== inndeling.id)
    .map((item) => item.nummer);
  const prefixNumber = "kommunenummer" in inndeling ? inndeling.kommunenummer.kodeverdi : undefined;
  const validateInndelingNumber = getNumberValidatorFunctionForInndelingType(inndelingtype);
  const registerOptions = {
    nummer: validateInndelingNumber({ shouldNotBeEqualWith: existingInndelingtypeNumbers, prefixNumber: prefixNumber }),
    navn: {
      required: `${capitalize(inndelingtype)}navn kan ikke være tomt`,
    },
  };

  // Ved undo og redo må grensesnittet oppdateres med riktig informasjon
  const setFormValues = (change: MetadataEntry["changes"][number], direction: HistoryDirection) => {
    const inndelingChange = change[direction];
    if ("samiskforvaltningsomraade" in inndelingChange) {
      setValue(`${inndelingChange.lokalid}.samiskforvaltningsomraade`, inndelingChange.samiskforvaltningsomraade);
    } else {
      setValue(`${inndelingChange.identifikasjon.lokalid}.nummer`, inndelingChange.nummer ?? "");
      setValue(`${inndelingChange.identifikasjon.lokalid}.navn`, inndelingChange.navn ?? "");
    }
    previousValues.current = structuredClone(getValues());
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

  return (
    <Row key={inndelingId} $isSearchMatch={isSearchMatch}>
      {isKommuneInndeling(inndeling) ? (
        <>
          <TableCell>{inndeling.nummer}</TableCell>
          <TableCell>{getNavnInSpraak(inndeling.navn, "nor")}</TableCell>
          <MerknadCell
            isEditing={isEditing}
            isDisabled={disabledDate != null}
            data={getValues(`${inndelingId}.samiskforvaltningsomraade`) ?? inndeling.samiskforvaltningsomraade}
            validationError={
              inndelingErrors && "samiskforvaltningsomraade" in inndelingErrors
                ? validationError(inndelingErrors.samiskforvaltningsomraade)
                : undefined
            }
            {...register(`${inndelingId}.samiskforvaltningsomraade`)}
          />
          <TableCell>
            <FremtidigEndringIcon
              formattedDate={disabledDate != null ? datestringToFormattedDatestring(disabledDate) : undefined}
            />
          </TableCell>
        </>
      ) : (
        <>
          <InputCell
            isEditing={isEditing}
            isDisabled={disabledDate != null}
            data={getValues(`${inndelingId}.nummer`) ?? inndeling.nummer}
            validationError={
              inndelingErrors != null && "nummer" in inndelingErrors
                ? validationError(inndelingErrors.nummer)
                : undefined
            }
            {...register(`${inndelingId}.nummer`, disabledDate == null ? registerOptions.nummer : undefined)}
          />
          <InputCell
            isEditing={isEditing}
            isDisabled={disabledDate != null}
            data={getValues(`${inndelingId}.navn`) ?? inndeling.navn}
            validationError={
              inndelingErrors != null && "navn" in inndelingErrors ? validationError(inndelingErrors.navn) : undefined
            }
            {...register(`${inndelingId}.navn`, disabledDate == null ? registerOptions.navn : undefined)}
          />
          <TableCell>{isStemmekretsInndeling(inndeling) ? inndeling.valgdistriktsnummer ?? "" : ""}</TableCell>
          <TableCell>
            <FremtidigEndringIcon
              formattedDate={disabledDate != null ? datestringToFormattedDatestring(disabledDate) : undefined}
            />
          </TableCell>
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

const Row = styled.tr<{ $isSearchMatch: boolean }>`
  ${(props) =>
    !props.$isSearchMatch &&
    css`
      display: none !important;
    `};
`;
