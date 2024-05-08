import { TabPanel } from "@kvib/react";
import { Inndeling } from "contexts/InndelingerContext/InndelingerContext";
import { styled } from "styled-components";
import { useFlatedata } from "./useFlatedata";
import { getIdFromEntity } from "utils/api";
import { getNavnInSpraak } from "utils/language/language";
import { capitalize } from "utils/string-utils";
import { orderInndelingerBy, useKretsTableSort } from "./useKretsTableSort";
import KretsTableHeader from "./KretsTableHeader";
import { useForm } from "react-hook-form";
import FlatedataFooter from "./FlatedataFooter";
import { useEffect, useRef } from "react";
import { MetadataResponse } from "types/api";
import { useHistory } from "contexts/HistoryContext/HistoryContext";
import { useUtkastEntity } from "contexts/UtkastContext/UtkastContext";
import KretsTableRow from "./KretsTableRow";
import { FlatedataInputs, reduceFlatedataChanges } from "./flatedata-utils";
import { GrunnkretsEntry, KommuneEntry, StemmekretsEntry } from "contexts/HistoryContext/types";

type Props = {
  inndeling: Inndeling;
  isEditing: boolean;
  setIsEditing: (isEditing: boolean) => void;
  searchValue: string;
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

  const formMethods = useForm<FlatedataInputs>();
  const {
    reset,
    getValues,
    handleSubmit,
    formState: { isDirty },
  } = formMethods;

  // Hold styr på forrige tilstand i formet slik at vi har sammenlikningsgrunnlag for history
  const previousValues = useRef<FlatedataInputs>();
  useEffect(() => {
    if (!isEditing) {
      previousValues.current = undefined;
    }
    if (isEditing && !previousValues.current) {
      previousValues.current = structuredClone(getValues());
    }
  }, [getValues, isEditing]);

  const toggleEditing = () => {
    if (isEditing) {
      reset(previousValues.current);
    }
    setIsEditing(!isEditing);
  };

  const kretsPrefix = isAdministrativEnhet ? "Kommune" : capitalize(inndeling.inndelingtype);

  const submitAndAddHistoryEntry = (data: FlatedataInputs) => {
    const changes = reduceFlatedataChanges(data, previousValues.current, utkastFlatedata, inndeling);

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

            const isSearchMatch =
              krets.nummer.includes(searchValue) ||
              getNavnInSpraak(krets.navn, "nor").toLowerCase().includes(searchValue);

            return (
              <KretsTableRow
                key={kretsId}
                inndeling={inndeling}
                krets={krets}
                isSearchMatch={isSearchMatch}
                isEditing={isEditing}
                formMethods={formMethods}
                previousValues={previousValues}
              />
            );
          })}
        </tbody>
      </Table>
      <FlatedataFooter
        isEditing={isEditing}
        toggleEditing={toggleEditing}
        canSave={isDirty}
        onSubmit={handleSubmit(submitAndAddHistoryEntry)}
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
