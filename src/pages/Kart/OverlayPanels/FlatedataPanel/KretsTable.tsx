import { TabPanel } from "@kvib/react";
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
import InputCell, { MerknadCell, TableCell } from "./KretsTableCells";
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
  isEditing: boolean;
  setIsEditing: (isEditing: boolean) => void;
};

const KretsTable = ({ inndeling, isEditing, setIsEditing }: Props) => {
  const flatedata = useFlatedata(inndeling) ?? [];
  const { sortProperty, sortOrder, sortHeaderProps } = useKretsTableSort(inndeling.inndelingtype);
  const isAdministrativEnhet = inndeling.inndelingtype === "fylke" || inndeling.inndelingtype === "kommune";

  const {
    register,
    getValues,
    handleSubmit,
    formState: { isDirty, errors },
  } = useForm<FormInputs>();

  const validationError = (error: FieldError | undefined | null) => {
    if (error) {
      return {
        showError: true,
        message: error.message,
      } as ValidationError;
    }
  };

  // TODO: history
  // TODO: form history sync for undo og redo?
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
    setIsEditing(!isEditing);
  };

  const kretsPrefix = isAdministrativEnhet ? "Kommune" : capitalize(inndeling.inndelingtype);

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
            const kretsErrors = errors[kretsId];
            return (
              <tr key={kretsId}>
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
              </tr>
            );
          })}
        </tbody>
      </Table>
      <FlatedataFooter
        isEditing={isEditing}
        toggleEditing={() => setIsEditing(!isEditing)}
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

export default KretsTable;
