import { Icon, IconButton, Tooltip, useToast } from "@kvib/react";
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
import {
  FlatedataInputs,
  isNonExhaustiveInndelingtype,
  isValidTempFlateId,
  isValidUrl,
  validateBopliktomraadeUtstrekning,
} from "./flatedata-utils";
import { SortPropertyFor } from "./useFlatedataTableSort";
import FeatureToggle from "components/FeatureToggle";
import { useHistory } from "contexts/HistoryContext/HistoryContext";
import { ArchiveInndelingEntry } from "contexts/HistoryContext/types";
import {
  archiveFeaturesForInndeling,
  inndelingIsArchivedInHistory,
  inndelingIsArchivedInUtkast,
  unarchiveFeaturesForInndeling,
} from "pages/Kart/interactions/archive-features";
import { useUtkast } from "contexts/UtkastContext/UtkastContext";
import { useFeatureStyle } from "contexts/FeatureStyleContext/FeatureStyleContext";
import { statusCode } from "utils/api";

export type InndelingErrors = Partial<Record<string, FieldError>> | undefined;

export type FlatedataColumnCtx = {
  inndeling: MetadataResponse;
  inndelingId: string;
  inndelingtype: FlatedataTableInndelingtype;
  isEditing: boolean;
  disabledDate: string | undefined;
  isArchived: boolean;
  formMethods: UseFormReturn<FlatedataInputs>;
  control: Control<FlatedataInputs>;
  inndelingErrors: InndelingErrors;
  allInndelinger: MetadataResponse[];
  activeInndelingerCount: number;
  sammenslaaingInformasjon: string | undefined;
  canEditInndeling: boolean;
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

type SetInndelingArchivedOptions = {
  shouldArchive: boolean;
  addToHistory: boolean;
};

const FremtidigEndringIcon = ({ formattedDate }: FremtidigEndringIconProps) => {
  return (
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
  );
};

const ArkiverInndelingButton = (ctx: FlatedataColumnCtx) => {
  const { addHistoryEntry, getHistoryEntries } = useHistory();
  const { utkast, updateUtkast } = useUtkast();
  const { addArchivedStyles, removeArchivedStyles } = useFeatureStyle();
  const toast = useToast();

  const setInndelingArchived = ({ shouldArchive, addToHistory }: SetInndelingArchivedOptions) => {
    if (isNonExhaustiveInndelingtype(ctx.inndelingtype) === false) {
      return;
    }

    const archivedInndeling = {
      identifikator: {
        lokalId: ctx.inndeling.id.lokalid.value,
        version: ctx.inndeling.version,
      },
    };
    const featureIds = shouldArchive
      ? archiveFeaturesForInndeling(ctx.inndelingId, ctx.inndelingtype)
      : unarchiveFeaturesForInndeling(ctx.inndelingId, ctx.inndelingtype);

    if (shouldArchive) {
      addArchivedStyles(featureIds);
    } else {
      removeArchivedStyles(featureIds);
    }

    if (addToHistory) {
      const archiveInndelingEntry: ArchiveInndelingEntry = {
        type: "archive_inndeling",
        changes: [
          {
            id: ctx.inndelingId,
            flatetype: ctx.inndelingtype,
            from: shouldArchive ? null : archivedInndeling,
            to: shouldArchive ? archivedInndeling : null,
          },
        ],
      };
      addHistoryEntry(archiveInndelingEntry);
    }

    const inndelingLabel = getInndelingtypeLabel(ctx.inndelingtype, { definiteForm: true });
    const inndelingName = `"${ctx.inndeling.nummer} ${getNavnInSpraak(ctx.inndeling.navn, "nor")}"`;
    toast({
      status: "success",
      title: shouldArchive
        ? `Arkiverte ${inndelingLabel} ${inndelingName}.`
        : `Angret arkivering av ${inndelingLabel} ${inndelingName}.`,
    });
  };

  const handleArchiveInndeling = () => {
    setInndelingArchived({ shouldArchive: true, addToHistory: true });
  };

  const handleUndoArchivingFromHistoryOrUtkast = () => {
    if (isNonExhaustiveInndelingtype(ctx.inndelingtype) === false) {
      return;
    }
    if (inndelingIsArchivedInHistory(ctx.inndelingId, getHistoryEntries()) === true) {
      setInndelingArchived({ shouldArchive: false, addToHistory: true });
    } else if (utkast != null && inndelingIsArchivedInUtkast(ctx.inndelingId, utkast) === true) {
      updateUtkast(
        utkast.id,
        {
          ...utkast,
          operasjoner: {
            ...utkast.operasjoner,
            archiveInndelingEndringer: utkast.operasjoner.archiveInndelingEndringer?.filter(
              (endring) => endring.identifikator.lokalId !== ctx.inndelingId,
            ),
          },
        },
        false,
      ).then((status: number | null) => {
        if (status != null && statusCode.isSuccessful(status)) {
          setInndelingArchived({ shouldArchive: false, addToHistory: false });
        }
      });
    }
  };

  return ctx.isArchived ? (
    <Tooltip label="Angre arkivering av inndelingen" placement="left" hasArrow>
      <IconButton
        variant="ghost"
        aria-label="Angre arkivering av inndelingen"
        icon="undo"
        onClick={handleUndoArchivingFromHistoryOrUtkast}
      />
    </Tooltip>
  ) : (
    <Tooltip label="Arkiver inndelingen" placement="left" hasArrow>
      <IconButton variant="ghost" aria-label="Arkiver inndelingen" icon="archive" onClick={handleArchiveInndeling} />
    </Tooltip>
  );
};

const SlettInndelingButton = (ctx: FlatedataColumnCtx) => {
  return (
    <Tooltip label="Slett inndelingen fra utkastet." placement="left" hasArrow>
      <IconButton
        variant="ghost"
        aria-label="Slett inndelingen"
        icon="delete_forever"
        onClick={() => {
          return ctx;
        }}
      />
    </Tooltip>
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

const archiveColumn = <T extends FlatedataTableInndelingtype>(): FlatedataColumn<T> => ({
  header: "",
  renderCell: (ctx: FlatedataColumnCtx) => (
    <TableCell className="archive-action-cell">
      <FeatureToggle feature="ARCHIVE_INNDELING">
        {isNonExhaustiveInndelingtype(ctx.inndelingtype) && ctx.canEditInndeling ? (
          <ArkiverInndelingButton {...ctx} />
        ) : (
          <></>
        )}
      </FeatureToggle>
    </TableCell>
  ),
});

const deleteColumn = <T extends FlatedataTableInndelingtype>(): FlatedataColumn<T> => ({
  header: "",
  renderCell: (ctx: FlatedataColumnCtx) => (
    <TableCell>
      <FeatureToggle feature="DELETE_INNDELING">
        {isNonExhaustiveInndelingtype(ctx.inndelingtype) && ctx.canEditInndeling ? (
          <SlettInndelingButton {...ctx} />
        ) : (
          <></>
        )}
      </FeatureToggle>
    </TableCell>
  ),
});

const endColumn = <T extends FlatedataTableInndelingtype>(): FlatedataColumn<T> => ({
  header: "",
  renderCell: (ctx: FlatedataColumnCtx) => {
    if (ctx.disabledDate != null) {
      return lockIconColumn<T>().renderCell({ ...ctx });
    } else if (isValidTempFlateId(ctx.inndeling.id.lokalid.value)) {
      return deleteColumn<T>().renderCell({ ...ctx });
    } else {
      return archiveColumn<T>().renderCell({ ...ctx });
    }
  },
});

const withTrailingSpacerAndEndColumn = <T extends FlatedataTableInndelingtype>(
  cols: FlatedataColumn<T>[],
): FlatedataColumn<T>[] => {
  const hasStretchColumn = cols.some((c) => c.size === "1fr");
  return hasStretchColumn ? [...cols, endColumn()] : [...cols, spacerColumn(), endColumn()];
};

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
    const shouldValidate = isEditing && disabledDate == null;
    return (
      <InputCell
        isEditing={isEditing}
        isDisabled={disabledDate != null}
        data={getValues(`${inndelingId}.nummer`) ?? inndeling.nummer}
        validationError={
          inndelingErrors != null && "nummer" in inndelingErrors ? validationError(inndelingErrors.nummer) : undefined
        }
        {...register(`${inndelingId}.nummer`, shouldValidate ? registerOptions : undefined)}
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
    const shouldValidate = isEditing && disabledDate == null;
    return (
      <InputCell
        isEditing={isEditing}
        isDisabled={disabledDate != null}
        data={getValues(`${inndelingId}.navn`) ?? inndeling.navn}
        validationError={
          inndelingErrors != null && "navn" in inndelingErrors ? validationError(inndelingErrors.navn) : undefined
        }
        {...register(`${inndelingId}.navn`, shouldValidate ? registerOptions : undefined)}
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
        const shouldValidate = isEditing && disabledDate == null;
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
            {...register(`${inndelingId}.tellekretsnummer`, shouldValidate ? tellekretsNummerOptions : undefined)}
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
        const shouldValidate = isEditing && disabledDate == null;
        const tellekretsnavnRegister = register(
          `${inndelingId}.tellekretsnavn`,
          shouldValidate ? tellekretsNavnOptions : undefined,
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
        const shouldValidate = isEditing && disabledDate == null;
        return (
          <URLInputCell
            isEditing={isEditing}
            isDisabled={disabledDate != null}
            data={getValues(`${inndelingId}.forskriftsreferanse`) ?? bopliktomraade.forskriftsreferanse}
            {...register(`${inndelingId}.forskriftsreferanse`, shouldValidate ? urlOptions : undefined)}
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
      renderCell: ({
        inndeling,
        inndelingId,
        isEditing,
        disabledDate,
        formMethods,
        inndelingErrors,
        activeInndelingerCount,
      }) => {
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
              validate: (gjelderKunDelAvKommunen) =>
                validateBopliktomraadeUtstrekning(gjelderKunDelAvKommunen, activeInndelingerCount),
            })}
            validationError={
              inndelingErrors != null && "gjelderKunDelAvKommunen" in inndelingErrors
                ? validationError(inndelingErrors.gjelderKunDelAvKommunen)
                : undefined
            }
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
  ];
};

export function getFlatedataColumns<T extends FlatedataTableInndelingtype>(inndelingtype: T): FlatedataColumn<T>[] {
  switch (inndelingtype) {
    case "FYLKE":
    case "KOMMUNE":
      return withTrailingSpacerAndEndColumn(getKommuneColumns()) as FlatedataColumn<T>[];
    case "STEMMEKRETS":
      return withTrailingSpacerAndEndColumn(getStemmekretsColumns()) as FlatedataColumn<T>[];
    case "GRUNNKRETS":
      return withTrailingSpacerAndEndColumn(getGrunnkretsColumns()) as FlatedataColumn<T>[];
    case "BOPLIKTOMRAADE":
      return withTrailingSpacerAndEndColumn(getBopliktomraadeColumns()) as FlatedataColumn<T>[];
  }
}
