import { Icon, Tooltip } from "@kvib/react";
import { ValidationError } from "components/Input";
import { Control, Controller, FieldError, UseFormReturn } from "react-hook-form";
import { styled } from "styled-components";
import {
  BopliktomraadeResponse,
  GrunnkretsResponse,
  KommuneResponse,
  MetadataResponse,
  StemmekretsResponse,
} from "types/api";
import { getInndelingtypeLabel, getNumberValidatorFunctionForInndelingType } from "utils/inndelinger-utils";
import { getNavnInSpraak } from "utils/language/language";
import { isIntegerString } from "utils/type-utils";
import { datestringToFormattedDatestring } from "../GrenseinformasjonPanel/grenseinformasjon-utils";
import type { FlatedataTableInndelingtype } from "./FlatedataPanel";
import InputCell, {
  MaterielleVilkaarOptions,
  MerknadCell,
  MultiSelectCell,
  SelectCell,
  TableCell,
  URLInputCell,
} from "./FlatedataTableCells";
import { FlatedataInputs, isValidUrl } from "./flatedata-utils";
import { SortPropertyFor } from "./useFlatedataTableSort";

export type InndelingErrors = Partial<Record<string, FieldError>> | undefined;

export type FlatedataColumnCtx = {
  inndeling: MetadataResponse;
  inndelingId: string;
  inndelingtype: FlatedataTableInndelingtype;
  isEditing: boolean;
  disabledDate: string | undefined;
  formMethods: UseFormReturn<FlatedataInputs>;
  control: Control<FlatedataInputs>;
  inndelingErrors: InndelingErrors;
  allInndelinger: MetadataResponse[];
  sammenslaaingInformasjon: string | undefined;
};

export type FlatedataColumn<T extends FlatedataTableInndelingtype = FlatedataTableInndelingtype> = {
  header: string;
  sortKey?: SortPropertyFor<T>;
  size?: string;
  renderCell: (ctx: FlatedataColumnCtx) => React.ReactNode;
};

const validationError = (error: FieldError | undefined | null): ValidationError | undefined => {
  if (error) {
    return {
      showError: true,
      message: error.message,
    } as ValidationError;
  }
  return undefined;
};

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

const SpacerCell = styled.td`
  /* Fyller ledig plass slik at lock-ikonet trekkes helt til høyre. */
`;

const lockIconColumn = <T extends FlatedataTableInndelingtype>(): FlatedataColumn<T> => ({
  header: "",
  renderCell: ({ disabledDate }) => (
    <TableCell>
      <FremtidigEndringIcon
        formattedDate={disabledDate != null ? datestringToFormattedDatestring(disabledDate) : undefined}
      />
    </TableCell>
  ),
});

const spacerColumn = <T extends FlatedataTableInndelingtype>(): FlatedataColumn<T> => ({
  header: "",
  size: "1fr",
  renderCell: () => <SpacerCell />,
});

const getKommuneColumns = <T extends "FYLKE" | "KOMMUNE">(): FlatedataColumn<T>[] => {
  const prefix = "Kommune";
  return [
    {
      header: `${prefix}nummer`,
      sortKey: "nummer",
      renderCell: ({ inndeling }) => {
        const kommune = inndeling as KommuneResponse;
        return <TableCell>{kommune.nummer}</TableCell>;
      },
    },
    {
      header: `${prefix}navn`,
      sortKey: "navn",
      renderCell: ({ inndeling }) => {
        const kommune = inndeling as KommuneResponse;
        return <TableCell>{getNavnInSpraak(kommune.navn, "nor")}</TableCell>;
      },
    },
    {
      header: "Merknad",
      sortKey: "samiskforvaltningsomraade",
      renderCell: ({ inndeling, inndelingId, isEditing, disabledDate, formMethods, inndelingErrors }) => {
        const kommune = inndeling as KommuneResponse;
        const { register, getValues } = formMethods;
        return (
          <MerknadCell
            isEditing={isEditing}
            isDisabled={disabledDate != null}
            label="Samisk forvaltningsområde"
            data={getValues(`${inndelingId}.samiskforvaltningsomraade`) ?? kommune.samiskforvaltningsomraade}
            validationError={
              inndelingErrors != null && "samiskforvaltningsomraade" in inndelingErrors
                ? validationError(inndelingErrors.samiskforvaltningsomraade)
                : undefined
            }
            {...register(`${inndelingId}.samiskforvaltningsomraade`)}
          />
        );
      },
    },
    lockIconColumn(),
  ];
};

const nummerColumn = <T extends FlatedataTableInndelingtype>(inndelingtype: T, label: string): FlatedataColumn<T> => ({
  header: `${label}nummer`,
  sortKey: "nummer" as SortPropertyFor<T>,
  renderCell: ({ inndeling, inndelingId, isEditing, disabledDate, formMethods, inndelingErrors }) => {
    const { register, getValues, watch, trigger } = formMethods;
    const prefixNumber = "kommunenummer" in inndeling ? inndeling.kommunenummer.kodeverdi : undefined;
    const validateInndelingNumber = getNumberValidatorFunctionForInndelingType<FlatedataInputs, `${string}.nummer`>(
      inndelingtype,
    );
    const existingIndelingtypeNumbers = Object.entries(watch())
      .filter(([rowId]) => rowId !== inndelingId)
      .map(([, rowVal]) => rowVal.nummer);
    const registerOptions = validateInndelingNumber({
      shouldNotBeEqualWith: existingIndelingtypeNumbers,
      prefixNumber,
    });
    return (
      <InputCell
        isEditing={isEditing}
        isDisabled={disabledDate != null}
        data={getValues(`${inndelingId}.nummer`) ?? inndeling.nummer}
        validationError={
          inndelingErrors != null && "nummer" in inndelingErrors ? validationError(inndelingErrors.nummer) : undefined
        }
        {...register(`${inndelingId}.nummer`, disabledDate == null ? registerOptions : undefined)}
        onBlur={() => {
          trigger(); // Ønsker å validere de andre radene etter at vi har skrevet inn et nummer
        }}
      />
    );
  },
});

const navnColumn = <T extends FlatedataTableInndelingtype>(inndelingtype: T, label: string): FlatedataColumn<T> => ({
  header: `${label}navn`,
  sortKey: "navn" as SortPropertyFor<T>,
  renderCell: ({ inndeling, inndelingId, isEditing, disabledDate, formMethods, inndelingErrors }) => {
    const { register, getValues } = formMethods;
    const registerOptions = {
      required: `${getInndelingtypeLabel(inndelingtype, { pluralizeLabel: false, capitalizeLabel: true })}navn kan ikke være tomt`,
    };
    return (
      <InputCell
        isEditing={isEditing}
        isDisabled={disabledDate != null}
        data={getValues(`${inndelingId}.navn`) ?? inndeling.navn}
        validationError={
          inndelingErrors != null && "navn" in inndelingErrors ? validationError(inndelingErrors.navn) : undefined
        }
        {...register(`${inndelingId}.navn`, disabledDate == null ? registerOptions : undefined)}
      />
    );
  },
});

const getStemmekretsColumns = (): FlatedataColumn<"STEMMEKRETS">[] => {
  const label = getInndelingtypeLabel("STEMMEKRETS", { pluralizeLabel: false, capitalizeLabel: true });
  return [
    nummerColumn("STEMMEKRETS", label),
    navnColumn("STEMMEKRETS", label),
    {
      header: "Tellekretsnummer",
      sortKey: "tellekretsnummer",
      renderCell: ({ inndeling, inndelingId, isEditing, disabledDate, formMethods, inndelingErrors }) => {
        const stemmekrets = inndeling as StemmekretsResponse;
        const { register, getValues } = formMethods;
        const tellekretsNummerOptions = {
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
        };
        return (
          <InputCell
            isEditing={isEditing}
            isDisabled={disabledDate != null}
            data={getValues(`${inndelingId}.tellekretsnummer`) ?? stemmekrets.tellekretsnummer}
            validationError={
              inndelingErrors != null && "tellekretsnummer" in inndelingErrors
                ? validationError(inndelingErrors.tellekretsnummer)
                : undefined
            }
            {...register(`${inndelingId}.tellekretsnummer`, disabledDate == null ? tellekretsNummerOptions : undefined)}
          />
        );
      },
    },
    {
      header: "Tellekretsnavn",
      sortKey: "tellekretsnavn",
      renderCell: ({
        inndeling,
        inndelingId,
        isEditing,
        disabledDate,
        formMethods,
        inndelingErrors,
        allInndelinger,
      }) => {
        const stemmekrets = inndeling as StemmekretsResponse;
        const {
          register,
          getValues,
          trigger,
          formState: { isSubmitted },
        } = formMethods;
        const tellekretsNavnOptions = {
          validate: (navn: string) => {
            if (navn === "" && getValues(`${inndelingId}.tellekretsnummer`) !== "") {
              return "Tellekretsnavn må også oppgis";
            }

            const allNavnForNummer = new Set(
              Object.values(getValues())
                .filter(
                  (i) =>
                    i.tellekretsnummer !== "" && i.tellekretsnummer === getValues(`${inndelingId}.tellekretsnummer`),
                )
                .map((i) => i.tellekretsnavn)
                .concat(navn),
            );

            if (allNavnForNummer.size > 1) {
              return `Tellekretsnavn må være likt for alle med tellekretsnummer ${getValues(`${inndelingId}.tellekretsnummer`)}`;
            }
          },
          required: undefined,
        };
        const tellekretsnavnRegister = register(
          `${inndelingId}.tellekretsnavn`,
          disabledDate == null ? tellekretsNavnOptions : undefined,
        );
        return (
          <InputCell
            isEditing={isEditing}
            isDisabled={disabledDate != null}
            data={getValues(`${inndelingId}.tellekretsnavn`) ?? stemmekrets.tellekretsnavn}
            validationError={
              inndelingErrors != null && "tellekretsnavn" in inndelingErrors
                ? validationError(inndelingErrors.tellekretsnavn)
                : undefined
            }
            {...tellekretsnavnRegister}
            onChange={(e) => {
              tellekretsnavnRegister.onChange(e);
              if (isSubmitted) {
                trigger(allInndelinger.map((i) => i.id.lokalid.value.concat(".tellekretsnavn")));
              }
            }}
          />
        );
      },
    },
    {
      header: "Valgdistriktsnummer",
      sortKey: "valgdistriktsnummer",
      renderCell: ({ inndeling }) => {
        const stemmekrets = inndeling as StemmekretsResponse;
        return <TableCell>{stemmekrets.valgdistriktsnummer}</TableCell>;
      },
    },
    {
      header: "Informasjon",
      size: "1fr",
      renderCell: ({ inndeling, inndelingId, isEditing, disabledDate, formMethods, sammenslaaingInformasjon }) => {
        const stemmekrets = inndeling as StemmekretsResponse;
        const { register, getValues } = formMethods;
        return (
          <InputCell
            isEditing={isEditing}
            isDisabled={disabledDate != null}
            data={sammenslaaingInformasjon ?? getValues(`${inndelingId}.informasjon`) ?? stemmekrets.informasjon}
            {...register(`${inndelingId}.informasjon`)}
          />
        );
      },
    },
    lockIconColumn(),
  ];
};

const getGrunnkretsColumns = (): FlatedataColumn<"GRUNNKRETS">[] => {
  const label = getInndelingtypeLabel("GRUNNKRETS", { pluralizeLabel: false, capitalizeLabel: true });
  return [
    nummerColumn("GRUNNKRETS", label),
    navnColumn("GRUNNKRETS", label),
    {
      header: "Informasjon",
      renderCell: ({ inndeling, inndelingId, isEditing, disabledDate, formMethods, sammenslaaingInformasjon }) => {
        const grunnkrets = inndeling as GrunnkretsResponse;
        const { register, getValues } = formMethods;
        return (
          <InputCell
            isEditing={isEditing}
            isDisabled={disabledDate != null}
            data={sammenslaaingInformasjon ?? getValues(`${inndelingId}.informasjon`) ?? grunnkrets.informasjon}
            {...register(`${inndelingId}.informasjon`)}
          />
        );
      },
    },
    spacerColumn(),
    lockIconColumn(),
  ];
};

const getBopliktomraadeColumns = (): FlatedataColumn<"BOPLIKTOMRAADE">[] => {
  const label = getInndelingtypeLabel("BOPLIKTOMRAADE", { pluralizeLabel: false, capitalizeLabel: true });
  const urlOptions = {
    validate: (value: string) => (!isValidUrl(value) ? "URL må starte med 'https://'" : undefined),
  };
  return [
    nummerColumn("BOPLIKTOMRAADE", label),
    navnColumn("BOPLIKTOMRAADE", label),
    {
      header: "Forskriftsreferanse",
      renderCell: ({ inndeling, inndelingId, isEditing, disabledDate, formMethods, inndelingErrors }) => {
        const bopliktomraade = inndeling as BopliktomraadeResponse;
        const { register, getValues } = formMethods;
        return (
          <URLInputCell
            isEditing={isEditing}
            isDisabled={disabledDate != null}
            data={getValues(`${inndelingId}.forskriftsreferanse`) ?? bopliktomraade.forskriftsreferanse}
            {...register(`${inndelingId}.forskriftsreferanse`, urlOptions)}
            validationError={
              inndelingErrors != null && "forskriftsreferanse" in inndelingErrors
                ? validationError(inndelingErrors.forskriftsreferanse)
                : undefined
            }
          />
        );
      },
    },
    {
      header: "Utstrekning",
      sortKey: "gjelderKunDelAvKommunen",
      renderCell: ({ inndeling, inndelingId, isEditing, disabledDate, formMethods }) => {
        const bopliktomraade = inndeling as BopliktomraadeResponse;
        const { register, getValues } = formMethods;
        const value = getValues(`${inndelingId}.gjelderKunDelAvKommunen`) ?? bopliktomraade.gjelderKunDelAvKommunen;
        return (
          <SelectCell
            isEditing={isEditing}
            isDisabled={disabledDate != null}
            options={[
              { label: "Deler av kommunen", value: "true" },
              { label: "Hele kommunen", value: "false" },
            ]}
            defaultValue={value ? "true" : "false"}
            data={value ? "Deler av kommunen" : "Hele kommunen"}
            {...register(`${inndelingId}.gjelderKunDelAvKommunen`, {
              setValueAs: (v) => (typeof v === "string" ? v === "true" : v),
            })}
          />
        );
      },
    },
    {
      header: "Har usikker avgrensning",
      sortKey: "harUsikkerAvgrensning",
      renderCell: ({ inndeling, inndelingId, isEditing, disabledDate, formMethods }) => {
        const bopliktomraade = inndeling as BopliktomraadeResponse;
        const { register, getValues } = formMethods;
        const existingHarUsikkerAvgrensning = bopliktomraade.harUsikkerAvgrensning ?? false;
        const harUsikkerAvgrensningValue =
          getValues(`${inndelingId}.harUsikkerAvgrensning`) ?? existingHarUsikkerAvgrensning;
        return (
          <SelectCell
            isEditing={isEditing}
            isDisabled={disabledDate != null}
            options={[
              { label: "Ja", value: "true" },
              { label: "Nei", value: "false" },
            ]}
            defaultValue={harUsikkerAvgrensningValue ? "true" : "false"}
            data={harUsikkerAvgrensningValue ? "Ja" : "Nei"}
            {...register(`${inndelingId}.harUsikkerAvgrensning`, {
              setValueAs: (v) => (typeof v === "string" ? v === "true" : v),
            })}
          />
        );
      },
    },
    {
      header: "Gjeldende materielle vilkår",
      renderCell: ({ inndeling, inndelingId, isEditing, disabledDate, control }) => {
        const bopliktomraade = inndeling as BopliktomraadeResponse;
        return (
          <Controller
            control={control}
            name={`${inndelingId}.gjeldendeMaterielleVilkaar`}
            defaultValue={bopliktomraade.gjeldendeMaterielleVilkaar ?? []}
            render={({ field }) => (
              <MultiSelectCell
                isEditing={isEditing}
                isDisabled={disabledDate != null}
                options={MaterielleVilkaarOptions}
                data={field.value ?? []}
                onChange={field.onChange}
              />
            )}
          />
        );
      },
    },
    {
      header: "Andre lokale avgrensninger",
      size: "1fr",
      renderCell: ({ inndeling, inndelingId, isEditing, disabledDate, formMethods }) => {
        const bopliktomraade = inndeling as BopliktomraadeResponse;
        const { register, getValues } = formMethods;
        return (
          <InputCell
            isEditing={isEditing}
            isDisabled={disabledDate != null}
            data={getValues(`${inndelingId}.andreLokaleAvgrensninger`) ?? bopliktomraade.andreLokaleAvgrensninger ?? ""}
            {...register(`${inndelingId}.andreLokaleAvgrensninger`)}
          />
        );
      },
    },
    lockIconColumn(),
  ];
};

export function getFlatedataColumns<T extends FlatedataTableInndelingtype>(inndelingtype: T): FlatedataColumn<T>[] {
  switch (inndelingtype) {
    case "FYLKE":
    case "KOMMUNE":
      return getKommuneColumns() as FlatedataColumn<T>[];
    case "STEMMEKRETS":
      return getStemmekretsColumns() as FlatedataColumn<T>[];
    case "GRUNNKRETS":
      return getGrunnkretsColumns() as FlatedataColumn<T>[];
    case "BOPLIKTOMRAADE":
      return getBopliktomraadeColumns() as FlatedataColumn<T>[];
  }
}
