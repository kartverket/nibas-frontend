import React, { useCallback } from "react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
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
import { HeaderButton, OverlayPanelWrapper } from "../metadataComponents";
import { useOverlayPanels } from "contexts/OverlayPanelsContext";
import Icon from "components/Icon";
import Heading from "components/typography/Heading";
import FutureChangesTable, {
  TableRow,
} from "../GrunnkretserPanel/FutureChangesTable";

type Props = {
  kommune: KommuneRef;
};

const StemmekretserPanel = ({ kommune }: Props) => {
  const { t } = useTranslation();
  const { isRowOpen, toggleRow } = useAccordionRows();
  const { isRowOpen: isFutureChangesOpen, toggleRow: toggleFutureChangesRow } =
    useAccordionRows();

  const { data: stemmekretserByKommune } = useNibasApi(
    "/v1/kommuner/{id}/stemmekretser",
    {
      id: kommune.id,
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
        id: stemmekrets.id,
        cells: [
          stemmekrets.stemmekretsnummer,
          stemmekrets.stemmekretsnavn,
          stemmekrets.tellekretsnavn,
          stemmekrets.tellekretsnummer,
          stemmekrets.valgdistriktsnummer,
          // Kan utkommenteres når APIet støtter dette
          // (stemmekrets as any).oppdatert ?? "2020-01-01",
          // (stemmekrets as any).type ?? "Retting",
          // (stemmekrets as any).gyldigFra ?? "2022-01-01",
          // (stemmekrets as any).gyldigTil ?? "2022-01-01",
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
      <PanelTitle tag="h2" size="xs">
        {t("{{ kommuneNavn }} kommune", {
          kommuneNavn: getNavnInSpraak(kommune.navn, "nor"),
        })}
      </PanelTitle>
      <HeaderButton
        right={0}
        icon={<Icon icon="close" />}
        onClick={() => {
          closePanel("stemmekrets");
          closePanel("grensemetadata");
          toggleEditKretser();
        }}
      />
      <HeaderButton
        right={50}
        onClick={() => toggleMinimizePanel("stemmekrets")}
        icon={
          kretserContext?.isMinimized ? (
            <Icon icon="expand_less" />
          ) : (
            <Icon icon="expand_more" />
          )
        }
      />

      <PanelTitle tag="h2" size="xs">
        {t("inndelinger.Stemmekretser")}
      </PanelTitle>
      {utkastStemmekretser && (
        <KretsTableWrapper>
          <KretsTable>
            <thead>
              <tr>
                <th>{t("tabell.Navn")}</th>
                <th>{t("stemmekrets.Stemmekretsnummer")}</th>
                <th>{t("stemmekrets.Valgdistriktsnummer")}</th>
                <th>{t("stemmekrets.Tellekretsnavn")}</th>
                <th>{t("stemmekrets.Tellekretsnummer")}</th>
                <th>{/* fremtidige endringer-knapp */}</th>
                <th>{/* dropdown-knapp */}</th>
              </tr>
            </thead>
            <tbody>
              {utkastStemmekretser.map((stemmekrets) => (
                <React.Fragment key={stemmekrets.id}>
                  <StemmekretsRow
                    stemmekretsRef={stemmekrets}
                    toggleRow={toggleRow}
                    isRowOpen={isRowOpen}
                    isFutureChangesOpen={isFutureChangesOpen(stemmekrets.id)}
                    toggleFutureChangesRow={toggleFutureChangesRow}
                  />
                  {isRowOpen(stemmekrets.id) && (
                    <EditRow stemmekrets={stemmekrets} kommuneId={kommune.id} />
                  )}
                  {isFutureChangesOpen(stemmekrets.id) && (
                    <FutureChangesTable
                      id={stemmekrets.id}
                      headers={headers}
                      getRows={getFutureChangesRows}
                      futureChangesUrl="/v1/grunnkretser/{lokalid}/framtidigeversjoner"
                    />
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

export default StemmekretserPanel;
