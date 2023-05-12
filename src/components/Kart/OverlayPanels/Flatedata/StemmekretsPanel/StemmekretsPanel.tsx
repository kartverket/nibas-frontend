import { useTranslation } from "react-i18next";
import { KretsTable } from "../KretsTable";
import StemmekretsRow from "./StemmekretsRow";
import { useUtkastEntity } from "contexts/UtkastContext";
import { StemmekretsResponse } from "types/api";
import { getIdFromEntity } from "utils/api";
import { useOverlayPanel } from "contexts/OverlayPanelContext";
import { PanelProps, Panel, PanelHeader } from "../../Panel";
import { useKommuneStemmekretser } from "hooks/inndelinger/useStemmekretser";

const StemmekretsPanel = ({ isOpen, className }: PanelProps) => {
  const { t } = useTranslation();
  const { flatedata, closeOverlay } = useOverlayPanel();

  // TODO: sorter etter navn eller nummer?
  const kommuneId = flatedata ? getIdFromEntity(flatedata) : "";
  const { data: stemmekretserByKommune } = useKommuneStemmekretser(kommuneId);
  const utkastStemmekretser = useUtkastEntity(
    stemmekretserByKommune,
    "stemmekretsendringer"
  ) as StemmekretsResponse[] | undefined;

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
              <th>{/* Tom plass for knapp i rader */}</th>
            </tr>
          </thead>
          <tbody>
            {utkastStemmekretser
              .sort(
                (a, b) =>
                  parseInt(a.stemmekretsnummer) - parseInt(b.stemmekretsnummer)
              )
              .map((stemmekrets) => (
                <StemmekretsRow
                  key={getIdFromEntity(stemmekrets)}
                  stemmekrets={stemmekrets}
                  kommuneId={kommuneId}
                />
              ))}
          </tbody>
        </KretsTable>
      )}
    </Panel>
  );
};

export default StemmekretsPanel;
