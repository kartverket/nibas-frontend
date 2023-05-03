import React, { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { KretsTable, KretsTableWrapper } from "../KretsTable";
import useAccordionRows from "../useAccordionRow";
import EditRow from "./EditRow";
import StemmekretsRow from "./StemmekretsRow";
import { useUtkastEntity } from "contexts/UtkastContext";
import useNibasApi from "hooks/useNibasApi";
import { StemmekretsRef, StemmekretsResponse } from "types/api";
import {
  getNavnInSpraak,
  sortGrenserAlphabetically,
} from "utils/language/language";
import {
  OverlayPanelWrapper,
  PanelHeader,
  PanelTitle,
} from "../metadataComponents";
import FutureChangesTable, {
  TableRow,
} from "../GrunnkretserPanel/FutureChangesTable";
import { FutureChangesTableData } from "../kretserComponents";
import { getIdFromEntity } from "utils/api";
import { useDataPanel } from "contexts/DataPanelContext";

const StemmekretserPanel = () => {
  const { t } = useTranslation();
  const { flatedata } = useDataPanel();
  const { isRowOpen, toggleRow } = useAccordionRows();
  const { isRowOpen: isFutureChangesOpen, toggleRow: toggleFutureChangesRow } =
    useAccordionRows();

  const kommuneId = flatedata ? getIdFromEntity(flatedata) : "";

  const { data: stemmekretserByKommune } = useNibasApi(
    kommuneId ? "/v1/kommuner/{id}/stemmekretser" : null,
    {
      id: kommuneId,
    }
  );

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
          stemmekrets.oppdateringsdato,
          stemmekrets.endringstype,
          stemmekrets.gyldighet.gyldigFra,
          stemmekrets.gyldighet.gyldigTil,
        ],
      })),
    []
  );

  return (
    <OverlayPanelWrapper key="stemmekrets" gridArea="kretser">
      <PanelHeader>
        <PanelTitle tag="h2" size="xs">
          {t("{{ kommuneNavn }} kommune", {
            kommuneNavn: getNavnInSpraak(flatedata?.navn, "nor"),
          })}
        </PanelTitle>
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
                    <EditRow
                      stemmekrets={stemmekrets}
                      kommuneId={kommuneId}
                      alleStemmekretser={
                        utkastStemmekretser.filter(
                          (s) => s.nummer !== stemmekrets.nummer
                        ) || []
                      }
                      toggleRow={toggleRow}
                    />
                  )}
                  {isFutureChangesOpen(getIdFromEntity(stemmekrets)) && (
                    <tr>
                      <FutureChangesTableData colSpan={7}>
                        <FutureChangesTable
                          id={getIdFromEntity(stemmekrets)}
                          headers={headers}
                          getRows={getFutureChangesRows}
                          futureChangesUrl="/v1/stemmekretser/{lokalid}/framtidigeversjoner"
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
