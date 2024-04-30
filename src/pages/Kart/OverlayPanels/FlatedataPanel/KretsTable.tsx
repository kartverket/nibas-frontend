import { Badge, TabPanel } from "@kvib/react";
import { Inndeling } from "contexts/InndelingerContext/InndelingerContext";
import { styled } from "styled-components";
import { isKommuneInndeling, isStemmekretsInndeling, useFlatedata } from "./useFlatedata";
import { getIdFromEntity } from "utils/api";
import { getNavnInSpraak } from "utils/language/language";
import { capitalize } from "utils/string-utils";
import { orderInndelingerBy, useKretsTableSort } from "./useKretsTableSort";
import KretsTableHeader from "./KretsTableHeader";
import { FieldError, RegisterOptions, useForm } from "react-hook-form";
import FlatedataFooter from "./FlatedataFooter";
import { useState } from "react";
import InputCell, { TableCell } from "./InputCell";
import { ValidationError } from "components/Input";
import { isIntegerString } from "utils/type-utils";

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
};

const KretsTable = ({ inndeling }: Props) => {
  const [isEditing, setIsEditing] = useState(false);

  const flatedata = useFlatedata(inndeling) ?? [];
  const { sortProperty, sortOrder, sortHeaderProps } = useKretsTableSort(inndeling.inndelingtype);

  const isAdministrativEnhet = inndeling.inndelingtype === "fylke" || inndeling.inndelingtype === "kommune";

  const defaultValues = flatedata.reduce<FormInputs>((inndelinger, currentInndeling) => {
    if (isKommuneInndeling(currentInndeling)) {
      inndelinger[getIdFromEntity(currentInndeling)] = {
        samiskforvaltningsomraade: currentInndeling.samiskforvaltningsomraade,
      };
    } else {
      inndelinger[getIdFromEntity(currentInndeling)] = {
        nummer: currentInndeling.nummer,
        navn: currentInndeling.navn,
      };
    }
    return inndelinger;
  }, {});

  const {
    register,
    getValues,
    handleSubmit,
    formState: { isDirty, errors },
  } = useForm<FormInputs>({ defaultValues });

  const validationError = (error: FieldError | undefined | null) => {
    if (error) {
      return {
        showError: true,
        message: error.message,
      } as ValidationError;
    }
  };

  const saveAndAddHistoryEntry = () => {
    /*
    const newValues = getValues();
    addHistoryEntry({
      type: "stemmekrets",
      kommuneId,
      changes: [
        {
          from: fromFormToRequest(previousValues.current, stemmekrets),
          to: fromFormToRequest(newValues, stemmekrets),
          id: stemmekretsId,
        },
      ],
    });
    updateEditFeatureText(getRepresentasjonspunktId(stemmekretsId), newValues.navn, newValues.nummer);
    */
    setIsEditing((value) => !value);
  };

  const kretsPrefix = isAdministrativEnhet ? "Kommune" : capitalize(inndeling.inndelingtype);

  // TODO: legg til mer?
  const registerOptions: Record<string, RegisterOptions> = {
    nummer: {
      required: `${kretsPrefix}nummer kan ikke være tomt`,
      validate: (nummer: string) => {
        if (!isIntegerString(nummer) || parseInt(nummer) > 9999) {
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

            return (
              <tr key={kretsId}>
                {isKommuneInndeling(krets) ? (
                  <>
                    <TableCell>{krets.nummer}</TableCell>
                    <TableCell>{getNavnInSpraak(krets.navn, "nor")}</TableCell>
                    <TableCell>
                      {krets.samiskforvaltningsomraade && <Merknad>Samisk forvaltningsområde</Merknad>}
                    </TableCell>

                    {/* uhuhu hauh uahu hau 
                  <InputCell
                    isEditing={isEditing}
                    data={`${getValues(`${kretsId}.navn`)}`}
                    validationError={"navn" in errors ? validationError(errors.navn as FieldError) : undefined}
                    {...register("navn", registerOptions.navn)}
                  />
                  */}
                  </>
                ) : (
                  <>
                    <InputCell
                      isEditing={isEditing}
                      data={`${getValues(`${kretsId}.nummer`)}`}
                      validationError={"nummer" in errors ? validationError(errors.nummer as FieldError) : undefined}
                      {...register(`${kretsId}.nummer`, registerOptions.nummer)}
                    />
                    <InputCell
                      isEditing={isEditing}
                      data={`${getValues(`${kretsId}.navn`)}`}
                      validationError={"navn" in errors ? validationError(errors.navn as FieldError) : undefined}
                      {...register(`${kretsId}.navn`, registerOptions.navn)}
                    />
                    <TableCell>{isStemmekretsInndeling(krets) ? krets.valgdistriktsnummer ?? "" : ""}</TableCell>
                  </>
                )}
              </tr>
            );
          })}
        </tbody>
      </Table>
      <FlatedataFooter
        isEditing={isEditing}
        toggleEditing={() => setIsEditing((value) => !value)}
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

const Merknad = styled(Badge)`
  display: inline-flex;
  align-items: center;
  height: 100%;
  padding: 0 8px;
  text-transform: unset;
  vertical-align: unset;
  border-radius: 6px;
  background: var(--kvib-colors-orange-100);
`;

export default KretsTable;
