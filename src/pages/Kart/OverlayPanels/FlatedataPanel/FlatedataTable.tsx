import { Button, TabPanel, Text } from "@kvib/react";
import EditAndSaveButton from "components/EditAndSaveButton";
import FeatureToggle from "components/FeatureToggle";
import { useHistory } from "contexts/HistoryContext/HistoryContext";
import { KommuneEntry, MetadataEntry } from "contexts/HistoryContext/types";
import { useUtkast } from "contexts/UtkastContext/UtkastContext";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";
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
import { getFlatedataColumns } from "./FlatedatColumns";
import { FlatedataTableInndeling } from "./FlatedataPanel";
import FlatedataTableHeader from "./FlatedataTableHeader";
import { FlatedataTableRow } from "./FlatedataTableRow";
import {
  FlatedataInputs,
  getDefaultFlatedataForInndelingtype,
  getTempFlateId,
  isInndelingNonExhaustive,
  isValidTempFlateId,
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
  const { sortProperty, sortOrder, sortHeaderProps } = useFlatedataTableSort(mainInndeling.inndelingtype);
  const { addHistoryEntry } = useHistory();
  const columns = useMemo(() => getFlatedataColumns(mainInndeling.inndelingtype), [mainInndeling.inndelingtype]);
  const gridTemplateColumns = columns.map((c) => c.size ?? "auto").join(" ");
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
      clearNewFlatedata();
    }
    setIsEditing(!isEditing);
  };

  const submitAndAddHistoryEntry = (data: FlatedataInputs) => {
    clearSearch();
    clearNewFlatedata();

    const [newFlater, existingFlater] = partitionDictBy<FlatedataInputs>(data, isValidTempFlateId);

    const changesToExisting = reduceFlatedataChanges(existingFlater, previousValues.current, flatedata, mainInndeling);
    const newFlaterChanges = reduceFlatedataChangesForNewInndelinger(
      newFlater,
      flatedata,
      mainInndeling,
      previousValues.current,
    );
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
        type: "create_inndelinger",
        changes: newFlaterChanges,
      });
    }
    setIsEditing(!isEditing);
  };

  const setPreviousValues = (fd: FlatedataInputs | undefined) => (previousValues.current = fd);

  const handleCreateNewFlate = () => {
    if (isInndelingNonExhaustive(mainInndeling.inndelingtype) === true) {
      const nextNumberAsInt =
        flatedata.map((i) => parseInt(i.nummer, 10)).reduce((max, current) => (current > max ? current : max), 0) + 1;
      const nextNumber = nextNumberAsInt > 9 ? nextNumberAsInt.toString() : nextNumberAsInt.toString().padStart(2, "0");
      setTempFlatedata((prevState) => {
        const newFlate: MetadataResponse = getDefaultFlatedataForInndelingtype(mainInndeling.inndelingtype, {
          withNummer: nextNumber,
          withKommune: mainInndeling,
          withLokalid: getTempFlateId(mainInndeling.inndelingtype, mainInndeling?.id ?? ""),
        });
        return [...prevState, newFlate];
      });

      setIsEditing(true);
    }
  };

  const clearNewFlatedata = () => {
    setTempFlatedata([]);
  };

  return (
    <Container>
      <TableScrollArea $hasRows={flatedata.length > 0}>
        <Table $gridTemplateColumns={gridTemplateColumns}>
          <thead>
            <tr>
              {columns.map((c, i) => (
                <Fragment key={i}>
                  <FlatedataTableHeader text={c.header} {...(c.sortKey != null ? sortHeaderProps(c.sortKey) : {})} />
                </Fragment>
              ))}
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
                    columns={columns}
                    isSearchMatch={isSearchMatch}
                    isEditing={isEditing}
                    isNew={tempFlatedata.some((f) => getIdFromEntity(f) === inndelingId)}
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
        {flatedata.length > 0 && (
          <FeatureToggle feature="CREATE_MULTIPLE_INNDELINGER">
            {isEditing === true && isInndelingNonExhaustive(mainInndeling.inndelingtype) === true ? (
              <AddFlateContainer>
                <Button onClick={handleCreateNewFlate} leftIcon="add" variant="secondary">
                  Opprett ny flate
                </Button>
              </AddFlateContainer>
            ) : (
              <></>
            )}
          </FeatureToggle>
        )}
      </TableScrollArea>
      {flatedata.length === 0 && (
        <CreateFlateContainer>
          <FeatureToggle feature="CREATE_INNDELINGER">
            {
              <>
                <BoldHeading>{`Ingen ${getInndelingtypeLabel(mainInndeling.inndelingtype, { pluralizeLabel: true, capitalizeLabel: false })} i denne kommunen.`}</BoldHeading>
                {utkast != null ? (
                  <>
                    {`For å opprette et nytt ${getInndelingtypeLabel(mainInndeling.inndelingtype, { pluralizeLabel: false, capitalizeLabel: false })}, klikk på "Opprett ny flate".`}
                    <Button onClick={handleCreateNewFlate} leftIcon="add" variant="secondary">
                      Opprett ny flate
                    </Button>
                  </>
                ) : null}
              </>
            }
          </FeatureToggle>
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

const Container = styled(TabPanel)`
  display: flex;
  flex-direction: column;
  padding: 0;
  overflow: hidden;
`;

const TableScrollArea = styled.div<{ $hasRows: boolean }>`
  flex: ${({ $hasRows }) => ($hasRows ? "1 1 0" : "0 0 auto")};
  overflow: auto;
  min-height: 0;
`;

const Table = styled.table<{ $gridTemplateColumns: string }>`
  display: grid;
  grid-template-columns: ${(props) => props.$gridTemplateColumns};
  grid-auto-rows: max-content;
  width: 100%;

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

  td input,
  td select {
    border-radius: var(--kvib-radii-md, 6px) !important;
  }
`;

const AddFlateContainer = styled.div`
  padding: 12px 16px;
`;

const CreateFlateContainer = styled.div`
  flex: 1;
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
