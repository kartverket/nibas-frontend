import { Button, TabPanel, Text } from "@kvib/react";
import EditAndSaveButton from "components/EditAndSaveButton";
import { useHistory } from "contexts/HistoryContext/HistoryContext";
import { KommuneEntry, MetadataEntry } from "contexts/HistoryContext/types";
import { useUtkast } from "contexts/UtkastContext/UtkastContext";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { styled } from "styled-components";
import {
  BopliktomraadeRequest,
  GrunnkretsRequest,
  INNDELINGTYPE_VALUES,
  KommuneRequest,
  MetadataResponse,
  StemmekretsRequest,
} from "types/api";
import { getIdFromEntity } from "utils/api";
import { getInndelingFremtidigEndringDato } from "utils/features";
import { getInndelingtypeLabel } from "utils/inndelinger-utils";
import { getNavnInSpraak } from "utils/language/language";
import { updateRepresentasjonspunkt } from "utils/map/layerStyles";
import { FlatedataTableInndeling } from "./FlatedataPanel";
import FlatedataTableHeader from "./FlatedataTableHeader";
import { FlatedataTableRow } from "./FlatedataTableRow";
import {
  FlatedataInputs,
  getDefaultFlatedataForInndelingtype,
  isInndelingNonExhaustive,
  isTempFlateId,
  partitionDictBy,
  reduceFlatedataChanges,
  reduceFlatedataChangesForNewInndelinger,
} from "./flatedata-utils";
import { useFlatedata } from "./useFlatedata";
import { orderInndelingerBy, useFlatedataTableSort } from "./useFlatedataTableSort";

type Props = {
  mainInndeling: FlatedataTableInndeling;
  isEditing: boolean;
  setIsEditing: (isEditing: boolean) => void;
  searchValue: string;
  clearSearch: () => void;
};

export type NonExhaustiveInndelingRequest = BopliktomraadeRequest;
export type ExhaustiveInndelingRequest = KommuneRequest | StemmekretsRequest | GrunnkretsRequest;
export const NONEXHAUSTIVE_INNDELINGTYPE_VALUES = INNDELINGTYPE_VALUES.filter((type) => type === "BOPLIKTOMRAADE");
export type NonExhaustiveInndelingtype = (typeof NONEXHAUSTIVE_INNDELINGTYPE_VALUES)[number];

const FlatedataTable = ({ mainInndeling, isEditing, setIsEditing, searchValue, clearSearch }: Props) => {
  const { utkast, utkastHarSammenslaainger } = useUtkast();
  const isAdministrativEnhet = mainInndeling.inndelingtype === "FYLKE" || mainInndeling.inndelingtype === "KOMMUNE";
  const { sortProperty, sortOrder, sortHeaderProps } = useFlatedataTableSort(mainInndeling.inndelingtype);
  const { addHistoryEntry } = useHistory();
  const [tempFlatedata, setTempFlatedata] = useState<MetadataResponse[]>([]);

  const utkastSammenslaaingEndring = utkast?.operasjoner.stemmekretsSammenslaaingsendring;
  const utkastSammenslaaingInformasjon: Record<string, string | undefined> =
    utkastSammenslaaingEndring?.stemmekretserTilSammenslaaing
      .concat(utkastSammenslaaingEndring?.viderefoertStemmekrets)
      .reduce(
        (acc, sk) => {
          acc[sk.lokalId] = utkast?.operasjoner.stemmekretsSammenslaaingsendring?.informasjon ?? undefined;
          return acc;
        },
        {} as Record<string, string | undefined>,
      ) ?? {};

  const flatedata = [...(useFlatedata(mainInndeling) ?? []), ...tempFlatedata];

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

  const inndelingPrefix = isAdministrativEnhet
    ? "Kommune"
    : getInndelingtypeLabel(mainInndeling.inndelingtype, { pluralizeLabel: false, capitalizeLabel: true });

  const submitAndAddHistoryEntry = (data: FlatedataInputs) => {
    clearSearch();
    clearNewFlatedata();

    const [newFlater, existingFlater] = partitionDictBy<FlatedataInputs>(data, isTempFlateId);

    const changesToExisting = reduceFlatedataChanges(existingFlater, previousValues.current, flatedata, mainInndeling);
    const newFlaterChanges = reduceFlatedataChangesForNewInndelinger(newFlater, flatedata, mainInndeling);
    if (changesToExisting.length < 1 && newFlaterChanges.length < 1) {
      return;
    }

    switch (mainInndeling.inndelingtype) {
      case "FYLKE":
      case "KOMMUNE":
        addHistoryEntry({
          type: "KOMMUNE",
          fylkeId: mainInndeling.id,
          changes: changesToExisting,
        } as KommuneEntry);
        break;
      case "STEMMEKRETS":
      case "GRUNNKRETS":
      case "BOPLIKTOMRAADE":
        addHistoryEntry({
          type: mainInndeling.inndelingtype,
          fylkeId: mainInndeling.id,
          changes: changesToExisting,
        } as MetadataEntry);
        break;
    }

    for (const change of changesToExisting) {
      if ("navn" in change.to && "nummer" in change.to) {
        updateRepresentasjonspunkt(change.id, change.to.nummer, change.to.navn);
      }
    }

    if (newFlaterChanges.length > 0) {
      addHistoryEntry({
        type: "create_inndeling",
        changes: newFlaterChanges,
      });
    }
    setIsEditing(!isEditing);
  };

  const setPreviousValues = (fd: FlatedataInputs | undefined) => (previousValues.current = fd);

  const handleCreateNewFlate = () => {
    if (isInndelingNonExhaustive(mainInndeling.inndelingtype)) {
      setTempFlatedata((prevState) => {
        const newFlate: MetadataResponse = getDefaultFlatedataForInndelingtype(
          mainInndeling.inndelingtype,
          mainInndeling,
        );
        return [...prevState, newFlate];
      });
      setIsEditing(true);
    }
  };

  const clearNewFlatedata = () => {
    setTempFlatedata([]);
  };

  return (
    <Container $emptyTable={flatedata.length === 0}>
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
                <th></th>
                <th></th>
                <th></th>
              </>
            ) : mainInndeling.inndelingtype === "STEMMEKRETS" ? (
              <>
                <FlatedataTableHeader text="Tellekretsnummer" {...sortHeaderProps("tellekretsnummer")} />
                <FlatedataTableHeader text="Tellekretsnavn" {...sortHeaderProps("tellekretsnavn")} />
                <FlatedataTableHeader text="Valgdistriktsnummer" {...sortHeaderProps("valgdistriktsnummer")} />
                <FlatedataTableHeader text="Informasjon" />
                <th></th>
                <th></th>
                <th></th>
              </>
            ) : mainInndeling.inndelingtype === "GRUNNKRETS" ? (
              <>
                <FlatedataTableHeader text="Informasjon" />
                <th></th>
                <th></th>
                <th></th>
                <th></th>
                <th></th>
                <th></th>
              </>
            ) : mainInndeling.inndelingtype === "BOPLIKTOMRAADE" ? (
              <>
                <FlatedataTableHeader text="Forskriftsreferanse" />
                <FlatedataTableHeader text="Utstrekning" {...sortHeaderProps("gjelderKunDelAvKommunen")} />
                <FlatedataTableHeader text="Har usikker avgrensning" {...sortHeaderProps("harUsikkerAvgrensning")} />
                <FlatedataTableHeader text="Gjeldende materielle vilkår" />
                <FlatedataTableHeader text="Andre lokale avgrensninger" />
                <th></th>
                <th></th>
              </>
            ) : (
              <></>
            )}
            <th></th>
          </tr>
        </thead>
        {flatedata.length > 0 && (
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
        )}
      </Table>
      {flatedata.length === 0 && (
        <CreateFlateContainer>
          <BoldHeading>{`Ingen ${getInndelingtypeLabel(mainInndeling.inndelingtype, { pluralizeLabel: true, capitalizeLabel: false })} i denne kommunen.`}</BoldHeading>
          {`For å opprette et nytt ${getInndelingtypeLabel(mainInndeling.inndelingtype, { pluralizeLabel: false, capitalizeLabel: false })}, klikk på "Opprett ny flate".`}
          <Button onClick={handleCreateNewFlate} leftIcon="add" variant="secondary">
            Opprett ny flate
          </Button>
        </CreateFlateContainer>
      )}
      <FlatedataFooter
        isEditing={isEditing}
        isDisabled={
          allInndelingerHasFremtidigEndring ||
          !utkast ||
          !(mainInndeling.isEditing === true) ||
          utkastHarSammenslaainger()
        }
        toggleEditing={toggleEditing}
        canSave={isDirty}
        onSubmit={(e) => {
          clearSearch();
          handleSubmit(submitAndAddHistoryEntry)(e);
        }}
        tooltip={
          flatedata.length === 0
            ? "Det finnes ingen flater i denne kommunen, og det er derfor ikke mulig å redigere flateinformasjon"
            : allInndelingerHasFremtidigEndring
              ? "Alle inndelingene i denne kommunen har endringer som inntrer på en fremtidig dato og kan derfor ikke redigeres"
              : utkastHarSammenslaainger()
                ? "Utkastet har sammenslåinger og kan derfor ikke redigeres"
                : utkast && mainInndeling.isEditing === true
                  ? null
                  : "Inndelingen er kun åpnet i forhåndsvisning og kan derfor ikke redigeres"
        }
      >
        Rediger flateinformasjon
      </FlatedataFooter>
    </Container>
  );
};

const BoldHeading = styled(Text)`
  font-weight: bold;
  font-size: var(--kvib-fontSizes-lg);
`;

const Container = styled(TabPanel)<{ $emptyTable: boolean }>`
  display: grid;
  grid-template-rows: ${({ $emptyTable }) => ($emptyTable ? "auto 1fr auto" : "1fr auto")};
  padding: 0;
  overflow: hidden;
`;

const Table = styled.table`
  display: grid;
  grid-template-columns: auto auto auto auto auto auto auto auto 1fr auto;
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
    padding: 12px 8px;
    border-bottom: 1px solid var(--kvib-colors-chakra-border-color);

    &:first-child {
      padding-left: 16px;
    }
  }
`;

const CreateFlateContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-items: center;
  justify-content: center;
`;

const FlatedataFooter = styled(EditAndSaveButton)`
  padding: 16px;
  border-top: 1px solid var(--kvib-colors-chakra-border-color);
`;

export default FlatedataTable;
