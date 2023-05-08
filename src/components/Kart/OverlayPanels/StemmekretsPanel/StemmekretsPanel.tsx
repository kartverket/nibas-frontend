import React, { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { KretsTable } from "../KretsTable";
import EditRow from "./EditRow";
import StemmekretsRow from "./StemmekretsRow";
import { useUtkastEntity } from "contexts/UtkastContext";
import useNibasApi from "hooks/useNibasApi";
import { StemmekretsRef, StemmekretsResponse } from "types/api";
import { sortGrenserAlphabetically } from "utils/language/language";
import { getIdFromEntity } from "utils/api";
import { useOverlayPanel } from "contexts/OverlayPanelContext";
import { useAccordionRows } from "../hooks/useAccordionRows";
import FutureChangesTable, {
  TableRow,
  FutureChangesTableData,
} from "../FutureChanges/FutureChangesTable";
import { PanelProps, Panel, PanelHeader } from "../Panel";

const StemmekretsPanel = ({ isOpen, className }: PanelProps) => {
  const { t } = useTranslation();
  const { flatedata, closeOverlay } = useOverlayPanel();
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
    <Panel isOpen={isOpen} className={className}>
      <PanelHeader onClose={closeOverlay}>Endre kretsdetaljer</PanelHeader>
      {utkastStemmekretser && (
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
      )}
    </Panel>
  );
};

export default StemmekretsPanel;
