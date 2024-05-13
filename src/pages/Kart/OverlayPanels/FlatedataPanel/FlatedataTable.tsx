import { TabPanel } from "@kvib/react";
import { Inndeling } from "contexts/InndelingerContext/InndelingerContext";
import { styled } from "styled-components";
import { useFlatedata } from "./useFlatedata";
import { getIdFromEntity } from "utils/api";
import { getNavnInSpraak } from "utils/language/language";
import { capitalize } from "utils/string-utils";
import { orderInndelingerBy, useFlatedataTableSort } from "./useFlatedataTableSort";
import FlatedataTableHeader from "./FlatedataTableHeader";
import { useForm } from "react-hook-form";
import { useEffect, useRef } from "react";
import { MetadataResponse } from "types/api";
import { useHistory } from "contexts/HistoryContext/HistoryContext";
import { useUtkast, useUtkastEntity } from "contexts/UtkastContext/UtkastContext";
import FlatedataTableRow from "./FlatedataTableRow";
import { FlatedataInputs, reduceFlatedataChanges } from "./flatedata-utils";
import { GrunnkretsEntry, KommuneEntry, StemmekretsEntry } from "contexts/HistoryContext/types";
import EditAndSaveButton from "components/EditAndSaveButton";

type Props = {
  mainInndeling: Inndeling;
  isEditing: boolean;
  setIsEditing: (isEditing: boolean) => void;
  searchValue: string;
};

const FlatedataTable = ({ mainInndeling, isEditing, setIsEditing, searchValue }: Props) => {
  const { utkast } = useUtkast();
  const isAdministrativEnhet = mainInndeling.inndelingtype === "fylke" || mainInndeling.inndelingtype === "kommune";
  const { sortProperty, sortOrder, sortHeaderProps } = useFlatedataTableSort(mainInndeling.inndelingtype);
  const { addHistoryEntry } = useHistory();

  const flatedata = useFlatedata(mainInndeling) ?? [];
  const utkastFlatedata = (useUtkastEntity(
    flatedata,
    `${mainInndeling.inndelingtype === "fylke" ? "kommune" : mainInndeling.inndelingtype}endringer`,
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

  const inndelingPrefix = isAdministrativEnhet ? "Kommune" : capitalize(mainInndeling.inndelingtype);

  const submitAndAddHistoryEntry = (data: FlatedataInputs) => {
    const changes = reduceFlatedataChanges(data, previousValues.current, utkastFlatedata, mainInndeling);

    if (changes.length > 0) {
      // Litt casting må til ettersom TypeScript ikke er smart nok til å tro på at vi har riktige typer
      if (mainInndeling.inndelingtype === "fylke" || mainInndeling.inndelingtype === "kommune") {
        addHistoryEntry({
          type: "kommune",
          fylkeId: mainInndeling.id,
          changes,
        } as KommuneEntry);
      } else {
        addHistoryEntry({
          type: mainInndeling.inndelingtype,
          kommuneId: mainInndeling.id,
          changes,
        } as StemmekretsEntry | GrunnkretsEntry);
      }

      setIsEditing(!isEditing);
    }
  };

  return (
    <Container>
      <Table>
        <thead>
          <tr>
            <FlatedataTableHeader {...sortHeaderProps("nummer")}>{`${inndelingPrefix}nummer`}</FlatedataTableHeader>
            <FlatedataTableHeader {...sortHeaderProps("navn")}>{`${inndelingPrefix}navn`}</FlatedataTableHeader>
            {isAdministrativEnhet ? (
              <FlatedataTableHeader {...sortHeaderProps("samiskforvaltningsomraade")}>Merknad</FlatedataTableHeader>
            ) : mainInndeling.inndelingtype === "stemmekrets" ? (
              <FlatedataTableHeader {...sortHeaderProps("valgdistriktsnummer")}>
                Valgdistriktsnummer
              </FlatedataTableHeader>
            ) : (
              <th></th>
            )}
          </tr>
        </thead>
        <tbody>
          {orderInndelingerBy(utkastFlatedata, sortProperty, sortOrder).map((inndeling) => {
            const inndelingId = getIdFromEntity(inndeling);

            const isSearchMatch =
              inndeling.nummer.includes(searchValue) ||
              getNavnInSpraak(inndeling.navn, "nor").toLowerCase().includes(searchValue);

            return (
              <FlatedataTableRow
                key={inndelingId}
                inndelingtype={mainInndeling.inndelingtype}
                inndeling={inndeling}
                isSearchMatch={isSearchMatch}
                isEditing={isEditing}
                formMethods={formMethods}
                previousValues={previousValues}
              />
            );
          })}
        </tbody>
      </Table>
      {utkast && mainInndeling.isEditing && (
        <>
          <FlatedataFooter
            isEditing={isEditing}
            toggleEditing={toggleEditing}
            isDisabled={!isDirty}
            onSubmit={handleSubmit(submitAndAddHistoryEntry)}
            hasIcon
          >
            Rediger flatedetaljer
          </FlatedataFooter>
        </>
      )}
    </Container>
  );
};

const FlatedataFooter = styled(EditAndSaveButton)`
  padding: 16px;
  border-top: 1px solid var(--kvib-colors-chakra-border-color);
`;

const Container = styled(TabPanel)`
  display: grid;
  grid-template-rows: 1fr auto;
  height: 100%;
  padding: 0;
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

export default FlatedataTable;
