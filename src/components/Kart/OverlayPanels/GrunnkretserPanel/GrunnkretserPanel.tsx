import React, { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import {
  ButtonCell,
  KretsRow,
  KretsTable,
  KretsTableWrapper,
} from "../KretsTable";
import {
  OverlayPanelWrapper,
  PanelHeader,
  PanelHeaderButton,
  PanelTitle,
} from "../metadataComponents";
import useAccordionRows from "../useAccordionRow";
import EditRow from "./EditRow";
import Input from "components/form/Input";
import Icon from "components/Icon";
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
import {
  FutureChangesTableData,
  ToggleableKretsButton,
} from "../kretserComponents";
import FutureChangesButton from "../FutureChangesButton";
import { getIdFromEntity } from "utils/api";

type Props = {
  kommune: KommuneRef;
};

const GrunnkretserPanel = ({ kommune }: Props) => {
  const kommuneId = getIdFromEntity(kommune);
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
      id: kommuneId,
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
      futureChanges.map(
        (grunnkrets) =>
          ({
            id: getIdFromEntity(grunnkrets),
            cells: [
              grunnkrets.grunnkretsnummer,
              grunnkrets.navn,
              grunnkrets.oppdateringsdato,
              grunnkrets.endringstype ?? "---",
              grunnkrets.gyldighet.gyldigFra,
              grunnkrets.gyldighet.gyldigTil,
            ],
          } as TableRow)
      ),
    []
  );

  const shouldShowFutureChangesButton = (grunnkrets: GrunnkretsRef) =>
    grunnkrets.antallFramtidigeVersjoner > 0;

  return (
    <OverlayPanelWrapper
      key="grunnkrets"
      gridArea="kretser"
      minimized={kretserContext?.isMinimized}
    >
      <PanelHeader>
        <PanelTitle tag="h2" size="xs">
          {t("{{ kommuneNavn }} kommune", {
            kommuneNavn: getNavnInSpraak(kommune.navn, "nor"),
          })}
        </PanelTitle>
        <PanelHeaderInput
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={t("grunnkrets.Søk")}
        />
        <PanelHeaderButton
          onClick={() => toggleMinimizePanel("grunnkrets")}
          icon={
            kretserContext?.isMinimized ? (
              <Icon icon="expand_less" />
            ) : (
              <Icon icon="expand_more" />
            )
          }
        />
        <PanelHeaderButton
          icon={<Icon icon="close" />}
          onClick={() => {
            closePanel("grunnkrets");
            closePanel("grensemetadata");
            toggleEditKretser();
          }}
        />
      </PanelHeader>
      {filteredGrunnkretser && (
        <KretsTableWrapper>
          <KretsTable>
            <thead>
              <tr>
                <th>{t("grunnkrets.Grunnkretsnummer")}</th>
                <th>{t("grunnkrets.Grunnkretsnavn")}</th>
                <th></th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredGrunnkretser.map((grunnkrets) => (
                <React.Fragment key={grunnkrets.id}>
                  <KretsRow isActive={isRowOpen(grunnkrets.id)}>
                    <td>{grunnkrets.grunnkretsnummer}</td>
                    <td>{getNavnInSpraak(grunnkrets.navn, "nor")}</td>
                    <ButtonCell>
                      {shouldShowFutureChangesButton(grunnkrets) && (
                        <FutureChangesButton
                          krets={grunnkrets}
                          isOpen={isFutureChangesOpen(
                            getIdFromEntity(grunnkrets)
                          )}
                          toggleRow={toggleFutureChangesRow}
                        />
                      )}
                    </ButtonCell>
                    <ButtonCell>
                      <ToggleableKretsButton
                        isOpen={isRowOpen(grunnkrets.id)}
                        onClick={() => toggleRow(grunnkrets.id)}
                        icon={<Icon icon="settings" />}
                      />
                    </ButtonCell>
                  </KretsRow>

                  {isRowOpen(getIdFromEntity(grunnkrets)) && (
                    <EditRow grunnkrets={grunnkrets} kommuneId={kommuneId} />
                  )}

                  {isFutureChangesOpen(getIdFromEntity(grunnkrets)) && (
                    <tr>
                      <FutureChangesTableData colSpan={4}>
                        <FutureChangesTable
                          id={getIdFromEntity(grunnkrets)}
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

const PanelHeaderInput = styled(Input)`
  width: 100%;
  max-width: 300px;
`;

export default GrunnkretserPanel;
