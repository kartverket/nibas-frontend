import { TabPanel } from "@kvib/react";
import EditAndSaveButton from "components/EditAndSaveButton";
import { useHistory } from "contexts/HistoryContext/HistoryContext";
import { KommuneEntry, MetadataEntry } from "contexts/HistoryContext/types";
import { useUtkast } from "contexts/UtkastContext/UtkastContext";
import { Fragment, useEffect, useMemo, useRef } from "react";
import { useForm } from "react-hook-form";
import { styled } from "styled-components";
import { getIdFromEntity } from "utils/api";
import { getInndelingFremtidigEndringDato } from "utils/features";
import { getNavnInSpraak } from "utils/language/language";
import { updateRepresentasjonspunkt } from "utils/map/layerStyles";
import { FlatedataTableInndeling } from "./FlatedataPanel";
import { getFlatedataColumns } from "./FlatedatColumns";
import FlatedataTableHeader from "./FlatedataTableHeader";
import { FlatedataTableRow } from "./FlatedataTableRow";
import { FlatedataInputs, reduceFlatedataChanges } from "./flatedata-utils";
import { useFlatedata } from "./useFlatedata";
import { orderInndelingerBy, useFlatedataTableSort } from "./useFlatedataTableSort";

type Props = {
  mainInndeling: FlatedataTableInndeling;
  isEditing: boolean;
  setIsEditing: (isEditing: boolean) => void;
  searchValue: string;
  clearSearch: () => void;
};

const FlatedataTable = ({ mainInndeling, isEditing, setIsEditing, searchValue, clearSearch }: Props) => {
  const { utkast, utkastHarSammenslaainger } = useUtkast();
  const { sortProperty, sortOrder, sortHeaderProps } = useFlatedataTableSort(mainInndeling.inndelingtype);
  const { addHistoryEntry } = useHistory();
  const columns = useMemo(() => getFlatedataColumns(mainInndeling.inndelingtype), [mainInndeling.inndelingtype]);
  const gridTemplateColumns = columns.map((c) => c.size ?? "auto").join(" ");

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

  const submitAndAddHistoryEntry = (data: FlatedataInputs) => {
    clearSearch();

    const changes = reduceFlatedataChanges(data, previousValues.current, flatedata, mainInndeling);
    if (changes.length < 1) {
      return;
    }

    switch (mainInndeling.inndelingtype) {
      case "FYLKE":
      case "KOMMUNE":
        addHistoryEntry({
          type: "KOMMUNE",
          fylkeId: mainInndeling.id,
          changes,
        } as KommuneEntry);
        break;
      case "STEMMEKRETS":
      case "GRUNNKRETS":
      case "BOPLIKTOMRAADE":
        addHistoryEntry({
          type: mainInndeling.inndelingtype,
          fylkeId: mainInndeling.id,
          changes,
        } as MetadataEntry);
        break;
    }

    for (const change of changes) {
      if ("navn" in change.to && "nummer" in change.to) {
        updateRepresentasjonspunkt(change.id, change.to.nummer, change.to.navn);
      }
    }

    setIsEditing(!isEditing);
  };

  const setPreviousValues = (fd: FlatedataInputs | undefined) => (previousValues.current = fd);

  return (
    <Container>
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
          allInndelingerHasFremtidigEndring
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

const Table = styled.table<{ $gridTemplateColumns: string }>`
  display: grid;
  grid-template-columns: ${(props) => props.$gridTemplateColumns};
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

export default FlatedataTable;
