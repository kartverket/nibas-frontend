import { TabPanel } from "@kvib/react";
import { Inndeling } from "contexts/InndelingerContext/InndelingerContext";
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
import { MetadataResponse } from "types/api";

type KommuneInputs = {
  [inndelingId: string]: {
    samiskforvaltningsomraade: boolean;
  };
};

type StemmekretsInputs = {
  [inndelingId: string]: {
    navn: string;
    nummer: string;
  };
};
type GrunnkretsInputs = StemmekretsInputs;
type FormInputs = KommuneInputs | StemmekretsInputs | GrunnkretsInputs;

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

/*
const fromFormToRequest = (
  inndelingtype: Inndelingtype,
  data: FormInputs,
  krets: MetadataResponse,
): MetadataRequest | null => {
  switch (inndelingtype) {
    case "fylke":
    case "kommune": {
      if (isKommuneInndeling(krets)) {
        const kommuneRequest: KommuneRequest = {
          lokalid: getIdFromEntity(krets),
          administrativenhetnavn: krets.navn,
          kommunenummerId: krets.,
          version: krets.version,
          samiskforvaltningsomraade: data.samiskforvaltningsomraade,
        };
        return kommuneRequest;
      }
    }
    case "stemmekrets": {
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
    case "grunnkrets": {
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
  }
};
*/

const KretsTable = ({ inndeling, isEditing, setIsEditing, searchValue }: Props) => {
  const flatedata = useFlatedata(inndeling) ?? [];
  const { sortProperty, sortOrder, sortHeaderProps } = useKretsTableSort(inndeling.inndelingtype);
  const isAdministrativEnhet = inndeling.inndelingtype === "fylke" || inndeling.inndelingtype === "kommune";
  // TODO: const { addHistoryEntry } = useHistory();

  const {
    register,
    reset,
    getValues,
    handleSubmit,
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
    /*
    const formValues = getValues();
    console.log("previous", previousValues.current);
    console.log("current", formValues);
    const changes = Object.entries(formValues).reduce((accumulator, [key, values]) => {
      const oldValues = previousValues.current?.[key];

      if (oldValues) {
        // Dersom kretsen er uendret skal vi ikke gjøre noe med den
        if ("samiskforvaltningsomraade" in oldValues) {
          if (values.samiskforvaltningsomraade === oldValues.samiskforvaltningsomraade) return accumulator;
        } else if ("navn" in oldValues) {
          if (values.nummer === oldValues.nummer && values.navn === oldValues.navn) return accumulator;
        }

        const krets = flatedata.find((flate) => getIdFromEntity(flate) === key);

        return [
          ...accumulator,
          {
            id: key,
            from: fromFormToRequest(inndeling.inndelingtype, previousValues.current, krets),
            to: fromFormToRequest(inndeling.inndelingtype, formValues, krets),
          },
        ];
      }
    }, []);

    if (inndeling.inndelingtype === "fylke" || inndeling.inndelingtype === "kommune") {
      addHistoryEntry({
        type: "kommune",
        fylkeId: inndeling.id,
        changes,
      });
    } else {
      addHistoryEntry({
        type: inndeling.inndelingtype,
        kommuneId: inndeling.id,
        changes,
      });
    }
    */

    // TODO: finn ut om det her trengs
    // updateEditFeatureText(getRepresentasjonspunktId(stemmekretsId), newValues.navn, newValues.nummer);
    setIsEditing(!isEditing);
  };

  /*
  // TODO: må håndtere dette på magisk vis
  const setFormValues = (change: StemmekretsEntry["changes"][number], direction: HistoryDirection) => {
    const newName = change[direction]?.navn;
    const newNumber = change[direction]?.nummer;
    setValue("navn", newName ?? "");
    setValue("nummer", newNumber ?? "");

    previousValues.current = getValues();

    updateEditFeatureText(getRepresentasjonspunktId(stemmekretsId), newName, newNumber);
  };

  // TODO: må håndtere dette på magisk vis
  useHistoryFormSync<StemmekretsEntry>({
    entityId: inndeling.id,
    redoEventKey: `${inndeling.inndelingtype}Redo`,
    undoEventKey: `${inndeling.inndelingtype}Undo`,
    setFormValues,
  });
  */

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
          {orderInndelingerBy(flatedata, sortProperty, sortOrder).map((krets) => {
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
                      {...register(`${kretsId}.nummer`, registerOptions.nummer)}
                    />
                    <InputCell
                      isEditing={isEditing}
                      data={getValues(`${kretsId}.navn`) ?? krets.navn}
                      validationError={
                        kretsErrors && "navn" in kretsErrors ? validationError(kretsErrors.navn) : undefined
                      }
                      {...register(`${kretsId}.navn`, registerOptions.navn)}
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
