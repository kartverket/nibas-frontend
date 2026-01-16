import { Icon, Tooltip } from "@kvib/react";
import { ValidationError } from "components/Input";
import { HistoryDirection, MetadataEntry } from "contexts/HistoryContext/types";
import { useHistoryFormSync } from "contexts/HistoryContext/useHistoryFormSync";
import { Control, FieldError, UseFormReturn, useFormState } from "react-hook-form";
import { css, styled } from "styled-components";
import { Inndelingtype, MetadataResponse } from "types/api";
import { getIdFromEntity } from "utils/api";
import { getInndelingFremtidigEndringDato } from "utils/features";
import { getNumberValidatorFunctionForInndelingType } from "utils/inndelinger-utils";
import { getNavnInSpraak } from "utils/language/language";
import { capitalize } from "utils/string-utils";
import { isIntegerString } from "utils/type-utils";
import { datestringToFormattedDatestring } from "../GrenseinformasjonPanel/grenseinformasjon-utils";
import { FlatedataInputs } from "./flatedata-utils";
import InputCell, { MerknadCell, TableCell } from "./FlatedataTableCells";
import { isBopliktomraadeInndeling, isKommuneInndeling, isStemmekretsInndeling } from "./useFlatedata";

type FremtidigEndringIconProps = {
  formattedDate: string | undefined;
};

const FremtidigEndringIcon = ({ formattedDate }: FremtidigEndringIconProps) => {
  return (
    formattedDate != null && (
      <Tooltip
        label={`Inndelingen har en fremtidig endring og kan ikke endres før endringen inntreffer. Endringer inntreffer ${formattedDate}`}
        placement="left"
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
  cursor: help;
`;

type Props = {
  inndelingtype: Inndelingtype;
  inndeling: MetadataResponse;
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
  isSearchMatch,
  isEditing,
  formMethods,
  setPreviousValues,
  allInndelinger,
  sammenslaaingInformasjon,
  control,
}: Props) => {
  const {
    setValue,
    getValues,
    register,
    trigger,
    watch,
    formState: { isSubmitted },
  } = formMethods;
  const inndelingId = getIdFromEntity(inndeling);
  const { errors } = useFormState({ control });
  const inndelingErrors = errors?.[inndelingId];

  const getExistingIndelingtypeNumbers = () => {
    const watchValues = watch();
    const watchedValues = Object.entries(watchValues)
      .filter(([rowId]) => rowId !== inndelingId)
      .map(([, rowVal]) => rowVal.nummer);
    return watchedValues;
  };
  const prefixNumber = "kommunenummer" in inndeling ? inndeling.kommunenummer.kodeverdi : undefined;
  const validateInndelingNumber = getNumberValidatorFunctionForInndelingType<FlatedataInputs, `${string}.nummer`>(
    inndelingtype,
  );

  const registerOptions = {
    nummer: validateInndelingNumber({
      shouldNotBeEqualWith: getExistingIndelingtypeNumbers(),
      prefixNumber: prefixNumber,
    }),
    navn: {
      required: `${capitalize(inndelingtype)}navn kan ikke være tomt`,
    },
  };

  const tellekretsRegisterOptions = {
    nummer: {
      validate: (nummer: string) => {
        if (nummer.length > 0) {
          if (!isIntegerString(nummer)) {
            return `Tellekretsnummer kan kun inneholde siffer`;
          }
          if (parseInt(nummer) <= 0) {
            return `Tellekretsnummer kan ikke være 0 eller et negativt tall`;
          }
          if (!(nummer.length >= 1 && nummer.length <= 4)) {
            return `Tellekretsnummer må ha minst 1 siffer og maks 4 siffer`;
          }
        }
        if (nummer === "" && getValues(`${inndelingId}.tellekretsnavn`) !== "") {
          return "Tellekretsnummer må også oppgis";
        }
      },
      required: undefined,
    },
    navn: {
      validate: (navn: string) => {
        if (navn === "" && getValues(`${inndelingId}.tellekretsnummer`) !== "") {
          return "Tellekretsnavn må også oppgis";
        }

        const allNavnForNummer = new Set(
          Object.values(getValues())
            .filter(
              (i) => i.tellekretsnummer !== "" && i.tellekretsnummer === getValues(`${inndelingId}.tellekretsnummer`),
            )
            .map((i) => i.tellekretsnavn)
            .concat(navn),
        );

        if (allNavnForNummer.size > 1) {
          return `Tellekretsnavn må være likt for alle med tellekretsnummer ${getValues(`${inndelingId}.tellekretsnummer`)}`;
        }
      },

      required: undefined,
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

  const tellekretsnavnRegister = {
    ...register(`${inndelingId}.tellekretsnavn`, disabledDate == null ? tellekretsRegisterOptions.navn : undefined),
  };

  return (
    <Row key={inndelingId} $isSearchMatch={isSearchMatch}>
      {isKommuneInndeling(inndeling) ? (
        <>
          <TableCell>{inndeling.nummer}</TableCell>
          <TableCell>{getNavnInSpraak(inndeling.navn, "nor")}</TableCell>
          <MerknadCell
            isEditing={isEditing}
            isDisabled={disabledDate != null}
            label="Samisk forvaltningsområde"
            data={getValues(`${inndelingId}.samiskforvaltningsomraade`) ?? inndeling.samiskforvaltningsomraade}
            validationError={
              inndelingErrors != null && "samiskforvaltningsomraade" in inndelingErrors
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
          <td></td>
          <td></td>
          <td></td>
          <td></td>
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
            onBlur={() => {
              trigger(); // Ønsker å validere de andre radene etter at vi har skrevet inn et nummer
            }}
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
          {isStemmekretsInndeling(inndeling) && (
            <InputCell
              isEditing={isEditing}
              isDisabled={disabledDate != null}
              data={getValues(`${inndelingId}.tellekretsnummer`) ?? inndeling.tellekretsnummer}
              validationError={
                inndelingErrors != null && "tellekretsnummer" in inndelingErrors
                  ? validationError(inndelingErrors.tellekretsnummer)
                  : undefined
              }
              {...register(
                `${inndelingId}.tellekretsnummer`,
                disabledDate == null ? tellekretsRegisterOptions.nummer : undefined,
              )}
            />
          )}
          {isStemmekretsInndeling(inndeling) && (
            <InputCell
              isEditing={isEditing}
              isDisabled={disabledDate != null}
              data={getValues(`${inndelingId}.tellekretsnavn`) ?? inndeling.tellekretsnavn}
              validationError={
                inndelingErrors != null && "tellekretsnavn" in inndelingErrors
                  ? validationError(inndelingErrors.tellekretsnavn)
                  : undefined
              }
              {...tellekretsnavnRegister}
              onChange={(e) => {
                tellekretsnavnRegister.onChange(e);
                if (isSubmitted) {
                  trigger(allInndelinger.map((i) => getIdFromEntity(i).concat(".tellekretsnavn")));
                }
              }}
            />
          )}
          {isStemmekretsInndeling(inndeling) && <TableCell>{inndeling.valgdistriktsnummer}</TableCell>}
          {isBopliktomraadeInndeling(inndeling) && (
            <>
              <MerknadCell
                isEditing={isEditing}
                isDisabled={disabledDate != null}
                label="Delvis boplikt"
                data={getValues(`${inndelingId}.delvisBoplikt`) ?? inndeling.delvisBoplikt}
                {...register(`${inndelingId}.delvisBoplikt`)}
              />
              <InputCell
                isEditing={isEditing}
                isDisabled={disabledDate != null}
                data={getValues(`${inndelingId}.forskriftsreferanse`) ?? inndeling.forskriftsreferanse}
                {...register(`${inndelingId}.forskriftsreferanse`)}
              />
              <InputCell
                isEditing={isEditing}
                isDisabled={disabledDate != null}
                data={getValues(`${inndelingId}.url`) ?? inndeling.url}
                {...register(`${inndelingId}.url`)}
              />
            </>
          )}
          <InputCell
            isEditing={isEditing}
            isDisabled={disabledDate != null}
            data={sammenslaaingInformasjon ?? getValues(`${inndelingId}.informasjon`) ?? inndeling.informasjon}
            {...register(`${inndelingId}.informasjon`)}
          />
          {!isKommuneInndeling(inndeling) &&
            !isStemmekretsInndeling(inndeling) &&
            !isBopliktomraadeInndeling(inndeling) && (
              <>
                <td></td>
                <td></td>
                <td></td>
              </>
            )}
          <td></td>
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
