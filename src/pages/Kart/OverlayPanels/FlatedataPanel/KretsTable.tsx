import { TabPanel } from "@kvib/react";
import { Inndeling, Inndelingtype } from "contexts/InndelingerContext/InndelingerContext";
import { styled, css } from "styled-components";
import { isKommuneInndeling, isStemmekretsInndeling, useFlatedata } from "./useFlatedata";
import { getIdFromEntity } from "utils/api";
import { getNavnInSpraak } from "utils/language/language";
import { capitalize } from "utils/string-utils";
import { orderInndelingerBy, useKretsTableSort } from "./useKretsTableSort";
import KretsTableHeader from "./KretsTableHeader";
import { FieldError, RegisterOptions, useForm } from "react-hook-form";
import FlatedataFooter from "./FlatedataFooter";
import InputCell, { MerknadCell, TableCell } from "./KretsTableCells";
import { ValidationError } from "components/Input";
import { isIntegerString } from "utils/type-utils";
import { useEffect, useRef } from "react";
import { GrunnkretsRequest, KommuneRequest, MetadataRequest, MetadataResponse, StemmekretsRequest } from "types/api";
import { useHistory } from "contexts/HistoryContext/HistoryContext";
import {
  GrunnkretsEntry,
  HistoryChange,
  HistoryDirection,
  KommuneEntry,
  MetadataEntry,
  StemmekretsEntry,
} from "contexts/HistoryContext/types";
import { updateEditFeatureText } from "utils/map/layerStyles";
import { getRepresentasjonspunktId } from "utils/map/source";
import { useHistoryFormSync } from "contexts/HistoryContext/useHistoryFormSync";
import { useUtkastEntity } from "contexts/UtkastContext/UtkastContext";

type KommuneInput = { samiskforvaltningsomraade: boolean };
type KommuneInputs = { [inndelingId: string]: KommuneInput };
type StemmekretsInput = { navn: string; nummer: string };
type StemmekretsInputs = { [inndelingId: string]: StemmekretsInput };
type GrunnkretsInputs = StemmekretsInputs;
type FormInputs = KommuneInputs | StemmekretsInputs | GrunnkretsInputs;

export const isKommuneInput = (value: KommuneInput | StemmekretsInput): value is KommuneInput =>
  "samiskforvaltningsomraade" in value;

type Props = {
  inndeling: Inndeling;
  isEditing: boolean;
  setIsEditing: (isEditing: boolean) => void;
  searchValue: string;
};

const validationError = (error: FieldError | undefined | null) => {
  if (error) {
    return {
      showError: true,
      message: error.message,
    } as ValidationError;
  }
};

const fromFormToRequest = (
  inndelingtype: Inndelingtype,
  data: KommuneInput | StemmekretsInput,
  krets: MetadataResponse,
): MetadataRequest | null => {
  switch (inndelingtype) {
    case "fylke":
    case "kommune": {
      if (isKommuneInndeling(krets) && isKommuneInput(data)) {
        const kommuneRequest: KommuneRequest = {
          lokalid: getIdFromEntity(krets),
          administrativenhetnavn: krets.navn,
          version: krets.version,
          samiskforvaltningsomraade: data.samiskforvaltningsomraade,
        };
        return kommuneRequest;
      }
      return null;
    }
    case "stemmekrets": {
      if (!isKommuneInput(data)) {
        const stemmekretsRequest: StemmekretsRequest = {
          identifikasjon: {
            lokalid: getIdFromEntity(krets),
          },
          valgdistriktsnummer: isStemmekretsInndeling(krets) ? krets.valgdistriktsnummer : undefined,
          version: krets.version,
          navn: data.navn,
          nummer: data.nummer,
        };
        return stemmekretsRequest;
      }
      return null;
    }
    case "grunnkrets": {
      if (!isKommuneInput(data)) {
        const grunnkretsRequest: GrunnkretsRequest = {
          identifikasjon: {
            lokalid: getIdFromEntity(krets),
          },
          version: krets.version,
          navn: data.navn,
          nummer: data.nummer,
        };
        return grunnkretsRequest;
      }
      return null;
    }
  }
};

const KretsTable = ({ inndeling, isEditing, setIsEditing, searchValue }: Props) => {
  const isAdministrativEnhet = inndeling.inndelingtype === "fylke" || inndeling.inndelingtype === "kommune";
  const { sortProperty, sortOrder, sortHeaderProps } = useKretsTableSort(inndeling.inndelingtype);
  const { addHistoryEntry } = useHistory();

  const flatedata = useFlatedata(inndeling) ?? [];
  const utkastFlatedata = (useUtkastEntity(
    flatedata,
    `${inndeling.inndelingtype === "fylke" ? "kommune" : inndeling.inndelingtype}endringer`,
  ) ?? []) as MetadataResponse[];

  const {
    register,
    reset,
    getValues,
    handleSubmit,
    setValue,
    formState: { isDirty, errors },
  } = useForm<FormInputs>();

  // Hold styr på forrige tilstand i formet slik at vi har sammenlikningsgrunnlag for history
  const previousValues = useRef<FormInputs>();
  useEffect(() => {
    if (!isEditing) {
      previousValues.current = undefined;
    }
    if (isEditing && !previousValues.current) {
      previousValues.current = structuredClone(getValues());
    }
  }, [getValues, isEditing]);

  // TODO: form history sync for undo og redo?

  // TODO: history
  const saveAndAddHistoryEntry = () => {
    const formValues = getValues();
    const changes = Object.entries(formValues).reduce<HistoryChange<MetadataRequest>[]>(
      (accumulator, [key, newValues]) => {
        const oldValues = previousValues.current?.[key];

        if (oldValues) {
          // Dersom kretsen er uendret skal vi ikke gjøre noe med den
          if (isKommuneInput(oldValues)) {
            if (newValues.samiskforvaltningsomraade === oldValues.samiskforvaltningsomraade) return accumulator;
          } else {
            if (newValues.nummer === oldValues.nummer && newValues.navn === oldValues.navn) return accumulator;
          }

          const krets = flatedata.find((flate) => getIdFromEntity(flate) === key);
          if (krets) {
            const fromRequest = fromFormToRequest(inndeling.inndelingtype, oldValues, krets);
            const toRequest = fromFormToRequest(inndeling.inndelingtype, newValues, krets);

            // TODO: verifiser at dette fungerer
            updateEditFeatureText(getRepresentasjonspunktId(key), newValues.navn, newValues.nummer);

            if (fromRequest && toRequest) {
              return [
                ...accumulator,
                {
                  id: key,
                  from: fromRequest,
                  to: toRequest,
                },
              ];
            }
          }
        }
        return accumulator;
      },
      [],
    );

    // Litt casting må til ettersom TypeScript ikke er smart nok til å tro på at vi har riktige typer
    if (inndeling.inndelingtype === "fylke" || inndeling.inndelingtype === "kommune") {
      addHistoryEntry({
        type: "kommune",
        fylkeId: inndeling.id,
        changes,
      } as KommuneEntry);
    } else {
      addHistoryEntry({
        type: inndeling.inndelingtype,
        kommuneId: inndeling.id,
        changes,
      } as StemmekretsEntry | GrunnkretsEntry);
    }

    setIsEditing(!isEditing);
  };

  const setFormValues = (change: MetadataEntry["changes"][number], direction: HistoryDirection) => {
    console.log("setFormValues", change, direction);
    const krets = change[direction];
    if ("samiskforvaltningsomraade" in krets) {
      setValue(`${krets.lokalid}.samiskforvaltningsomraade`, krets.samiskforvaltningsomraade);
    } else {
      console.log("ikke kommune", krets.identifikasjon.lokalid);
      setValue(`${krets.identifikasjon.lokalid}.nummer`, krets.nummer ?? "");
      setValue(`${krets.identifikasjon.lokalid}.navn`, krets.navn ?? "");
      updateEditFeatureText(getRepresentasjonspunktId(krets.identifikasjon.lokalid), krets.navn, krets.nummer);
    }
    previousValues.current = structuredClone(getValues());
  };

  // TODO: denne må nok registreres for hver rad
  useHistoryFormSync<MetadataEntry>({
    entityId: inndeling.id,
    redoEventKey: `${inndeling.inndelingtype}Redo`,
    undoEventKey: `${inndeling.inndelingtype}Undo`,
    setFormValues,
  });

  const toggleEditing = () => {
    if (isEditing) {
      reset(previousValues.current);
    }
    setIsEditing(!isEditing);
  };

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

  const isFiltered = (krets: MetadataResponse) =>
    krets.nummer.includes(searchValue) || getNavnInSpraak(krets.navn, "nor").toLowerCase().includes(searchValue);

  return (
    <Container>
      <Table>
        <thead>
          <tr>
            <KretsTableHeader {...sortHeaderProps("nummer")}>{`${kretsPrefix}nummer`}</KretsTableHeader>
            <KretsTableHeader {...sortHeaderProps("navn")}>{`${kretsPrefix}navn`}</KretsTableHeader>
            {isAdministrativEnhet ? (
              <KretsTableHeader {...sortHeaderProps("samiskforvaltningsomraade")}>Merknad</KretsTableHeader>
            ) : inndeling.inndelingtype === "stemmekrets" ? (
              <KretsTableHeader {...sortHeaderProps("valgdistriktsnummer")}>Valgdistriktsnummer</KretsTableHeader>
            ) : (
              <th></th>
            )}
          </tr>
        </thead>
        <tbody>
          {orderInndelingerBy(utkastFlatedata, sortProperty, sortOrder).map((krets) => {
            const kretsId = getIdFromEntity(krets);
            const kretsErrors = errors[kretsId];
            return (
              <Row key={kretsId} $isFiltered={!isFiltered(krets)}>
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
                      validationError={
                        kretsErrors && "nummer" in kretsErrors ? validationError(kretsErrors.nummer) : undefined
                      }
                      {...register(
                        `${kretsId}.nummer`,
                        isStemmekretsInndeling(krets) ? registerOptions.nummer : undefined,
                      )}
                    />
                    <InputCell
                      isEditing={isEditing}
                      data={getValues(`${kretsId}.navn`) ?? krets.navn}
                      validationError={
                        kretsErrors && "navn" in kretsErrors ? validationError(kretsErrors.navn) : undefined
                      }
                      {...register(`${kretsId}.navn`, isStemmekretsInndeling(krets) ? registerOptions.navn : undefined)}
                    />
                    <TableCell>{isStemmekretsInndeling(krets) ? krets.valgdistriktsnummer ?? "" : ""}</TableCell>
                  </>
                )}
              </Row>
            );
          })}
        </tbody>
      </Table>
      <FlatedataFooter
        isEditing={isEditing}
        toggleEditing={toggleEditing}
        canSave={isDirty}
        onSubmit={handleSubmit(saveAndAddHistoryEntry)}
      />
    </Container>
  );
};

const Container = styled(TabPanel)`
  padding: 0;
  height: 100%;
  display: grid;
  grid-template-rows: 1fr auto;
  overflow: hidden;
`;

const Table = styled.table`
  display: grid;
  grid-template-columns: auto auto 1fr;
  grid-auto-rows: max-content;
  width: 100%;
  overflow: auto;

  thead,
  tbody,
  tr {
    display: contents;
  }

  th {
    font-weight: normal;
    text-align: left;
  }

  th,
  td {
    padding: 12px 18px;
    border-bottom: 1px solid var(--kvib-colors-chakra-border-color);

    &:first-child {
      padding-left: 24px;
    }
  }
`;

const Row = styled.tr<{ $isFiltered: boolean }>`
  ${(props) =>
    props.$isFiltered &&
    css`
      display: none !important;
    `};
`;

export default KretsTable;
