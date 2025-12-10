import { TabPanel } from "@kvib/react";
import EditAndSaveButton from "components/EditAndSaveButton";
import { useHistory } from "contexts/HistoryContext/HistoryContext";
import { GrunnkretsEntry, KommuneEntry, StemmekretsEntry } from "contexts/HistoryContext/types";
import { Inndeling } from "contexts/InndelingerContext/InndelingerContext";
import { useUtkast } from "contexts/UtkastContext/UtkastContext";
import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { styled } from "styled-components";
import { getIdFromEntity } from "utils/api";
import { getInndelingFremtidigEndringDato } from "utils/features";
import { getNavnInSpraak } from "utils/language/language";
import { updateRepresentasjonspunkt } from "utils/map/layerStyles";
import { capitalize } from "utils/string-utils";
import FlatedataTableHeader from "./FlatedataTableHeader";
import { FlatedataTableRow } from "./FlatedataTableRow";
import { FlatedataInputs, reduceFlatedataChanges } from "./flatedata-utils";
import { useFlatedata } from "./useFlatedata";
import { orderInndelingerBy, useFlatedataTableSort } from "./useFlatedataTableSort";

type Props = {
  mainInndeling: Inndeling;
  isEditing: boolean;
  setIsEditing: (isEditing: boolean) => void;
  searchValue: string;
  clearSearch: () => void;
};

const FlatedataTable = ({ mainInndeling, isEditing, setIsEditing, searchValue, clearSearch }: Props) => {
  const { utkast, utkastHarSammenslaainger } = useUtkast();
  const isAdministrativEnhet = mainInndeling.inndelingtype === "fylke" || mainInndeling.inndelingtype === "kommune";
  const { sortProperty, sortOrder, sortHeaderProps } = useFlatedataTableSort(mainInndeling.inndelingtype);
  const { addHistoryEntry } = useHistory();

  const utkastSammenslaaingEndring = utkast?.operasjoner.stemmekretsSammenslaaingsendring;
  const utkastSammenslaaingInformasjon: Record<string, string | undefined> =
    utkastSammenslaaingEndring?.stemmekretserTilSammenslaaing
      .concat(utkastSammenslaaingEndring?.viderefoertStemmekrets)
      .reduce(
        (acc, sk) => {
          acc[sk.lokalId] = utkast?.operasjoner.stemmekretsSammenslaaingsendring?.informasjon;
          return acc;
        },
        {} as Record<string, string | undefined>,
      ) ?? {};

  const flatedata = useFlatedata(mainInndeling) ?? [];

  const allInndelingerHasFremtidigEndring = flatedata.every(
    (inndeling) => getInndelingFremtidigEndringDato(inndeling?.id.lokalid.value) != null,
  );
  const formMethods = useForm<FlatedataInputs>({
    mode: "onSubmit",
    reValidateMode: "onChange",
  });
  const {
    reset,
    getValues,
    handleSubmit,
    formState: { isDirty },
    control,
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
    clearSearch();
    const changes = reduceFlatedataChanges(data, previousValues.current, flatedata, mainInndeling);
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

      for (const change of changes) {
        if ("navn" in change.to && "nummer" in change.to) {
          updateRepresentasjonspunkt(change.id, change.to.nummer, change.to.navn);
        }
      }

      setIsEditing(!isEditing);
    }
  };

  const setPreviousValues = (fd: FlatedataInputs | undefined) => (previousValues.current = fd);

  return (
    <Container>
      <Table>
        <thead>
          <tr>
            <FlatedataTableHeader text={`${inndelingPrefix}nummer`} {...sortHeaderProps("nummer")} />
            <FlatedataTableHeader text={`${inndelingPrefix}navn`} {...sortHeaderProps("navn")} />
            {isAdministrativEnhet ? (
              <>
                <FlatedataTableHeader text="Merknad" {...sortHeaderProps("samiskforvaltningsomraade")} />
                <th></th>
                <th></th>
                <th></th>
              </>
            ) : mainInndeling.inndelingtype === "stemmekrets" ? (
              <>
                <FlatedataTableHeader text="Tellekretsnummer" {...sortHeaderProps("tellekretsnummer")} />
                <FlatedataTableHeader text="Tellekretsnavn" {...sortHeaderProps("tellekretsnavn")} />
                <FlatedataTableHeader text="Valgdistriktsnummer" {...sortHeaderProps("valgdistriktsnummer")} />
                <FlatedataTableHeader text="Informasjon" {...sortHeaderProps("informasjon")} />
              </>
            ) : mainInndeling.inndelingtype === "grunnkrets" ? (
              <>
                <FlatedataTableHeader text="Informasjon" {...sortHeaderProps("informasjon")} />
                <th></th>
                <th></th>
                <th></th>
              </>
            ) : mainInndeling.inndelingtype === "bopliktomraade" ? (
              <>
                <FlatedataTableHeader text="Merknad" {...sortHeaderProps("delvisBoplikt")} />
                <FlatedataTableHeader text="Forskriftsreferanse" {...sortHeaderProps("forskriftsreferanse")} />
                <FlatedataTableHeader text="URL" {...sortHeaderProps("url")} />
                <FlatedataTableHeader text="Informasjon" {...sortHeaderProps("informasjon")} />
              </>
            ) : (
              <></>
            )}
            <th></th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {orderInndelingerBy(flatedata, sortProperty, sortOrder).map((inndeling) => {
            const inndelingId = getIdFromEntity(inndeling);

            const isSearchMatch =
              inndeling.nummer.includes(searchValue) === true ||
              getNavnInSpraak(inndeling.navn, "nor").toLowerCase().includes(searchValue) === true;
            return (
              <FlatedataTableRow
                key={inndelingId}
                inndelingtype={mainInndeling.inndelingtype}
                inndeling={inndeling}
                isSearchMatch={isSearchMatch}
                isEditing={isEditing}
                formMethods={formMethods}
                control={control}
                setPreviousValues={setPreviousValues}
                allInndelinger={flatedata}
                sammenslaaingInformasjon={utkastSammenslaaingInformasjon[inndelingId]}
              />
            );
          })}
        </tbody>
      </Table>
      <FlatedataFooter
        isEditing={isEditing}
        isDisabled={
          allInndelingerHasFremtidigEndring ||
          !utkast ||
          !mainInndeling.isEditing ||
          utkastHarSammenslaainger() ||
          // TODO: Fjernes når det er klart for å redigere bopliktområder
          mainInndeling.inndelingtype === "bopliktomraade"
        }
        toggleEditing={toggleEditing}
        canSave={isDirty}
        onSubmit={(e) => {
          clearSearch();
          handleSubmit(submitAndAddHistoryEntry)(e);
        }}
        tooltip={
          allInndelingerHasFremtidigEndring
            ? "Alle inndelingene i denne kommunen har endringer som inntrer på en fremtidig dato og kan derfor ikke redigeres"
            : utkastHarSammenslaainger()
              ? "Utkastet har sammenslåinger og kan derfor ikke redigeres"
              : utkast && mainInndeling.isEditing
                ? null
                : "Inndelingen er kun åpnet i forhåndsvisning og kan derfor ikke redigeres"
        }
      >
        Rediger flatedetaljer
      </FlatedataFooter>
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
  grid-template-columns: auto auto auto auto auto auto 1fr auto;
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
      padding-left: 16px;
    }
  }
`;

export default FlatedataTable;
