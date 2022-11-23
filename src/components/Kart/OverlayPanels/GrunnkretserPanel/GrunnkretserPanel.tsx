import React, { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import { KretsRow, KretsTable, KretsTableWrapper } from "../KretsTable";
import {
  BlockLabel,
  HeaderButton,
  OverlayPanelWrapper,
} from "../metadataComponents";
import useAccordionRows from "../useAccordionRow";
import EditRow from "./EditRow";
import Input from "components/form/Input";
import Icon from "components/Icon";
import Heading from "components/typography/Heading";
import { useInndelingerKrets } from "contexts/InndelingerKretsContext";
import { useUtkastEntity } from "contexts/UtkastContext";
import useNibasApi from "hooks/useNibasApi";
import useSearch from "hooks/useSearch";
import { GrunnkretsRef, GrunnkretsResponse, KommuneRef } from "types/api";
import {
  getNavnInSpraak,
  sortGrenserAlphabetically,
} from "utils/language/language";
import { useOverlayPanels } from "contexts/OverlayPanelsContext";
import FutureChangesTable, { TableRow } from "./FutureChangesTable";
import { useFlag } from "components/FeatureToggle";
import {
  FutureChangesTableData,
  ToggleableKretsButton,
} from "../kretserComponents";

type Props = {
  kommune: KommuneRef;
};

const GrunnkretserPanel = ({ kommune }: Props) => {
  const { t } = useTranslation();
  const { toggleEditKretser } = useInndelingerKrets(kommune);

  const { isRowOpen, toggleRow } = useAccordionRows();
  const { isRowOpen: isFutureChangesOpen, toggleRow: toggleFutureChangesRow } =
    useAccordionRows();
  const { inputValue, setInputValue, searchValue } = useSearch();

  const { toggleMinimizePanel, kretserContext, closePanel } =
    useOverlayPanels();

  const { data: grunnkretserByKommune } = useNibasApi(
    "/v1/kommuner/{id}/grunnkretser",
    {
      id: kommune.id,
    }
  );

  const sortedGrunnkretser = useMemo(
    () => sortGrenserAlphabetically(grunnkretserByKommune),
    [grunnkretserByKommune]
  );

  const utkastGrunnkretser = useUtkastEntity(
    sortedGrunnkretser,
    "grunnkretsendringer"
  ) as GrunnkretsRef[] | undefined;

  const filteredGrunnkretser = useMemo(() => {
    if (!searchValue) return utkastGrunnkretser;

    return utkastGrunnkretser?.filter(
      (grunnkrets) =>
        grunnkrets.grunnkretsnummer.includes(searchValue) ||
        grunnkrets.navn.toLowerCase().includes(searchValue.toLowerCase())
    );
  }, [searchValue, utkastGrunnkretser]);

  const headers = [
    "Grunnkretsnummer",
    "Grunnkrets",
    "Oppdatert",
    "Type",
    "Gyldig fra",
    "Gyldig til",
  ];

  const getFutureChangesRows = useCallback(
    (futureChanges: GrunnkretsResponse[]): TableRow[] =>
      futureChanges.map((grunnkrets) => ({
        id: grunnkrets.id,
        cells: [
          grunnkrets.grunnkretsnummer,
          grunnkrets.navn,
          grunnkrets.oppdateringsdato,
          (grunnkrets as any).type ?? "Retting",
          grunnkrets.gyldighet.gyldigFra,
          grunnkrets.gyldighet.gyldigTil,
        ],
      })),
    []
  );

  const showFremtidigeEndringer = useFlag("grunnkrets-fremtidige-endringer");

  return (
    <OverlayPanelWrapper
      key="grunnkrets"
      gridArea="kretser"
      minimized={kretserContext?.isMinimized}
    >
      <PanelTitle tag="h2" size="xs">
        {t("{{ kommuneNavn }} kommune", {
          kommuneNavn: getNavnInSpraak(kommune.navn, "nor"),
        })}
      </PanelTitle>
      <HeaderButton
        right={0}
        icon={<Icon icon="close" />}
        onClick={() => {
          closePanel("grunnkrets");
          closePanel("grensemetadata");
          toggleEditKretser();
        }}
      />
      <HeaderButton
        right={50}
        onClick={() => toggleMinimizePanel("grunnkrets")}
        icon={
          kretserContext?.isMinimized ? (
            <Icon icon="expand_less" />
          ) : (
            <Icon icon="expand_more" />
          )
        }
      />
      <SmallerBlockLabel>
        {t("sidebar.Søk")}
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
      </SmallerBlockLabel>
      <PanelTitle tag="h2" size="xs">
        {t("inndelinger.Grunnkretser")}
      </PanelTitle>
      {filteredGrunnkretser && (
        <KretsTableWrapper>
          <KretsTable>
            <thead>
              <tr>
                <th>{t("tabell.Navn")}</th>
                <th>{t("grunnkrets.Grunnkretsnummer")}</th>
                {showFremtidigeEndringer && <th></th>}
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredGrunnkretser.map((grunnkrets) => (
                <React.Fragment key={grunnkrets.id}>
                  <KretsRow onClick={() => toggleRow(grunnkrets.id)}>
                    <td>{getNavnInSpraak(grunnkrets.navn, "nor")}</td>
                    <td>{grunnkrets.grunnkretsnummer}</td>
                    {showFremtidigeEndringer && (
                      <td>
                        <ToggleableKretsButton
                          isOpen={isFutureChangesOpen(grunnkrets.id)}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFutureChangesRow(grunnkrets.id);
                          }}
                          aria-label={`${
                            isFutureChangesOpen(grunnkrets.id) ? "Skjul" : "Vis"
                          } fremtidige endringer for ${getNavnInSpraak(
                            grunnkrets.navn,
                            "nor"
                          )}`}
                          icon={<Icon icon="schedule" />}
                        />
                      </td>
                    )}
                    <td>
                      <ToggleableKretsButton
                        isOpen={isRowOpen(grunnkrets.id)}
                        onClick={() => toggleRow(grunnkrets.id)}
                        icon={
                          isRowOpen(grunnkrets.id) ? (
                            <Icon icon="expand_less" />
                          ) : (
                            <Icon icon="expand_more" />
                          )
                        }
                      />
                    </td>
                  </KretsRow>
                  {isRowOpen(grunnkrets.id) && (
                    <EditRow grunnkrets={grunnkrets} kommuneId={kommune.id} />
                  )}
                  {showFremtidigeEndringer &&
                    isFutureChangesOpen(grunnkrets.id) && (
                      <tr>
                        <FutureChangesTableData colSpan={4}>
                          <FutureChangesTable
                            id={grunnkrets.id}
                            futureChangesUrl="/v1/grunnkretser/{lokalid}/framtidigeversjoner"
                            headers={headers}
                            getRows={getFutureChangesRows}
                          />
                        </FutureChangesTableData>
                      </tr>
                    )}
                </React.Fragment>
              ))}
            </tbody>
          </KretsTable>
        </KretsTableWrapper>
      )}
    </OverlayPanelWrapper>
  );
};

const PanelTitle = styled(Heading)`
  margin: 0;
  margin-bottom: 8px;
`;

const SmallerBlockLabel = styled(BlockLabel)`
  max-width: 400px;
`;

export default GrunnkretserPanel;
