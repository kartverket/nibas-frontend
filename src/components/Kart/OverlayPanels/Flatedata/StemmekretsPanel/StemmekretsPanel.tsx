import { useState } from "react";
import { useTranslation } from "react-i18next";
import { KretsTable } from "../KretsTable";
import StemmekretsRow from "./StemmekretsRow";
import { useUtkastEntity } from "contexts/UtkastContext";
import { StemmekretsResponse } from "types/api";
import { getIdFromEntity } from "utils/api";
import { useOverlayPanel } from "contexts/OverlayPanelContext";
import { PanelProps, Panel, PanelHeader } from "../../Panel";
import { useKommuneStemmekretser } from "hooks/inndelinger/useStemmekretser";
import SortHeader from "../SortHeader";
import orderBy from "lodash.orderby";

type SortProperty =
  | "stemmekretsnummer"
  | "stemmekretsnavn"
  | "tellekretsnavn"
  | "tellekretsnummer"
  | "valgdistriktsnummer";

const StemmekretsPanel = ({ isOpen, className }: PanelProps) => {
  const [sortProperty, setSortProperty] =
    useState<SortProperty>("stemmekretsnummer");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const { t } = useTranslation();
  const { flatedata, closeOverlayPanel } = useOverlayPanel();

  const kommuneId = flatedata ? getIdFromEntity(flatedata) : "";
  const { data: stemmekretserByKommune } = useKommuneStemmekretser(kommuneId);
  const utkastStemmekretser = useUtkastEntity(
    stemmekretserByKommune,
    "stemmekretsendringer"
  ) as StemmekretsResponse[] | undefined;

  const onSort = (property: SortProperty) => {
    if (property === sortProperty) {
      if (sortOrder === "asc") {
        setSortOrder("desc");
      } else if (sortOrder === "desc") {
        // Hvis man har trykket på en knapp tre ganger går vi tilbake til start
        setSortProperty("stemmekretsnummer");
        setSortOrder("asc");
      }
    } else {
      setSortProperty(property);
      setSortOrder("asc");
    }
  };

  const sortHeaderProps = (property: SortProperty) => ({
    onClick: () => onSort(property),
    isActive: sortProperty === property,
    isReversed: sortProperty === property && sortOrder === "desc",
  });

  return (
    <Panel isOpen={isOpen} className={className}>
      <PanelHeader onClose={closeOverlayPanel}>Endre kretsdetaljer</PanelHeader>
      {utkastStemmekretser && (
        <KretsTable>
          <thead>
            <tr>
              <SortHeader {...sortHeaderProps("stemmekretsnummer")}>
                {t("stemmekrets.Stemmekretsnummer")}
              </SortHeader>
              <SortHeader {...sortHeaderProps("stemmekretsnavn")}>
                {t("tabell.Stemmekretsnavn")}
              </SortHeader>
              <SortHeader {...sortHeaderProps("tellekretsnavn")}>
                {t("stemmekrets.Tellekretsnavn")}
              </SortHeader>
              <SortHeader {...sortHeaderProps("tellekretsnummer")}>
                {t("stemmekrets.Tellekretsnummer")}
              </SortHeader>
              <SortHeader {...sortHeaderProps("valgdistriktsnummer")}>
                {t("stemmekrets.Valgdistriktsnummer")}
              </SortHeader>
              <th>{/* Tom plass for knapp i rader */}</th>
            </tr>
          </thead>
          <tbody>
            {orderBy(utkastStemmekretser, sortProperty, sortOrder).map(
              (stemmekrets) => (
                <StemmekretsRow
                  key={getIdFromEntity(stemmekrets)}
                  stemmekrets={stemmekrets}
                  kommuneId={kommuneId}
                />
              )
            )}
          </tbody>
        </KretsTable>
      )}
    </Panel>
  );
};

export default StemmekretsPanel;
