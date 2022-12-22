/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { KretsTable, KretsTableWrapper } from "../KretsTable";
import useAccordionRows from "../useAccordionRow";
import EditRow from "./EditRow";
import StemmekretsRow from "./StemmekretsRow";
import { useInndelingerKrets } from "contexts/InndelingerKretsContext";
import { useUtkastEntity } from "contexts/UtkastContext";
import useNibasApi from "hooks/useNibasApi";
import { KommuneRef, StemmekretsRef, StemmekretsResponse } from "types/api";
import {
  getNavnInSpraak,
  sortGrenserAlphabetically,
} from "utils/language/language";
import {
  OverlayPanelWrapper,
  PanelHeader,
  PanelHeaderButton,
  PanelTitle,
} from "../metadataComponents";
import { useOverlayPanels } from "contexts/OverlayPanelsContext";
import Icon from "components/Icon";
import FutureChangesTable, {
  TableRow,
} from "../GrunnkretserPanel/FutureChangesTable";
import { FutureChangesTableData } from "../kretserComponents";
import { getIdFromEntity } from "utils/api";

type Props = {
  kommune: KommuneRef;
};

const StemmekretserPanel = ({ kommune }: Props) => {
  const kommuneId = getIdFromEntity(kommune);
  const { t } = useTranslation();
  const { isRowOpen, toggleRow } = useAccordionRows();
  const { isRowOpen: isFutureChangesOpen, toggleRow: toggleFutureChangesRow } =
    useAccordionRows();

  const { data: stemmekretserByKommune } = useNibasApi(
    "/v1/kommuner/{id}/stemmekretser",
    {
      id: kommuneId,
    }
  );

  const { toggleMinimizePanel, kretserContext, closePanel } =
    useOverlayPanels();
  const { toggleEditKretser } = useInndelingerKrets(kommune);

  const sortedStemmekretser = sortGrenserAlphabetically(stemmekretserByKommune);

  const utkastStemmekretser = useUtkastEntity(
    sortedStemmekretser,
    "stemmekretsendringer"
  ) as StemmekretsRef[] | undefined;

  const headers = [
    "Stemmekretsnummer",
    "Navn",
    "Tellekretsnavn",
    "Tellekretsnummer",
    "Valgdistriktsnummer",
    "Oppdatert",
    "Type",
    "Gyldig fra",
    "Gyldig til",
  ];

  const getFutureChangesRows = useCallback(
    (futureChanges: StemmekretsResponse[]): TableRow[] =>
      futureChanges.map((stemmekrets) => ({
        id: getIdFromEntity(stemmekrets),
        cells: [
          stemmekrets.stemmekretsnummer,
          stemmekrets.stemmekretsnavn,
          stemmekrets.tellekretsnavn,
          stemmekrets.tellekretsnummer,
          stemmekrets.valgdistriktsnummer,
          // Kan utkommenteres når APIet støtter dette
          (stemmekrets as any).oppdatert ?? "2020-01-01",
          (stemmekrets as any).type ?? "Retting",
          (stemmekrets as any).gyldigFra ?? "2022-01-01",
          (stemmekrets as any).gyldigTil ?? "2022-01-01",
        ],
      })),
    []
  );

  return (
    <OverlayPanelWrapper
      key="stemmekrets"
      gridArea="kretser"
      minimized={kretserContext?.isMinimized}
    >
      <PanelHeader>
        <PanelTitle tag="h2" size="xs">
          {t("{{ kommuneNavn }} kommune", {
            kommuneNavn: getNavnInSpraak(kommune.navn, "nor"),
          })}
        </PanelTitle>
        <PanelHeaderButton
          onClick={() => toggleMinimizePanel("stemmekrets")}
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
            closePanel("stemmekrets");
            closePanel("grensemetadata");
            toggleEditKretser();
          }}
        />
      </PanelHeader>
      {utkastStemmekretser && (
        <KretsTableWrapper>
          <KretsTable>
            <thead>
              <tr>
                <th>{t("stemmekrets.Stemmekretsnummer")}</th>
                <th>{t("tabell.Stemmekretsnavn")}</th>
                <th>{t("stemmekrets.Tellekretsnavn")}</th>
                <th>{t("stemmekrets.Tellekretsnummer")}</th>
                <th>{t("stemmekrets.Valgdistriktsnummer")}</th>
                <th>{/* fremtidige endringer-knapp */}</th>
                <th>{/* dropdown-knapp */}</th>
              </tr>
            </thead>
            <tbody>
              {utkastStemmekretser.map((stemmekrets) => (
                <React.Fragment key={getIdFromEntity(stemmekrets)}>
                  <StemmekretsRow
                    stemmekretsRef={stemmekrets}
                    toggleRow={toggleRow}
                    isRowOpen={isRowOpen}
                    isFutureChangesOpen={isFutureChangesOpen(
                      getIdFromEntity(stemmekrets)
                    )}
                    toggleFutureChangesRow={toggleFutureChangesRow}
                  />
                  {isRowOpen(getIdFromEntity(stemmekrets)) && (
                    <EditRow stemmekrets={stemmekrets} kommuneId={kommuneId} />
                  )}
                  {isFutureChangesOpen(getIdFromEntity(stemmekrets)) && (
                    <tr>
                      <FutureChangesTableData colSpan={7}>
                        <FutureChangesTable
                          id={getIdFromEntity(stemmekrets)}
                          headers={headers}
                          getRows={getFutureChangesRows}
                          futureChangesUrl="/v1/grunnkretser/{lokalid}/framtidigeversjoner"
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

export default StemmekretserPanel;
