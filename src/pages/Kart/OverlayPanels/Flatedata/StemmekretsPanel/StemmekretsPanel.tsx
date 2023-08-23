import { KretsTable } from "../KretsTable";
import StemmekretsRow from "./StemmekretsRow";
import { useUtkastEntity } from "contexts/UtkastContext";
import { StemmekretsResponse } from "types/api";
import { getIdFromEntity } from "utils/api";
import { useOverlayPanel } from "contexts/OverlayPanelContext";
import { PanelProps, Panel, PanelHeader } from "../../Panel";
import { useKommuneStemmekretser } from "hooks/inndelinger/useStemmekretser";
import SortHeader from "../SortHeader";
import { useTableSort } from "../useTableSort";
import { orderBy } from "utils/list-utils";

const StemmekretsPanel = ({ isOpen, className }: PanelProps) => {
  const { sortProperty, sortOrder, sortHeaderProps } = useTableSort([
    "stemmekretsnummer",
    "stemmekretsnavn",
    "valgdistriktsnummer",
  ]);

  const { flatedata, closeOverlayPanel } = useOverlayPanel();

  const kommuneId = flatedata ? getIdFromEntity(flatedata) : "";
  const { data: stemmekretserByKommune } = useKommuneStemmekretser(kommuneId);
  const utkastStemmekretser = useUtkastEntity(
    stemmekretserByKommune,
    "stemmekretsendringer"
  ) as StemmekretsResponse[] | undefined;

  return (
    <Panel $isOpen={isOpen} className={className}>
      <PanelHeader onClose={closeOverlayPanel}>Endre flateinfo</PanelHeader>
      {utkastStemmekretser && (
        <KretsTable>
          <thead>
            <tr>
              <SortHeader {...sortHeaderProps("stemmekretsnummer")}>
                Stemmekretsnummer
              </SortHeader>
              <SortHeader {...sortHeaderProps("stemmekretsnavn")}>
                Stemmekretsnavn
              </SortHeader>
              <SortHeader {...sortHeaderProps("valgdistriktsnummer")}>
                Valgdistriktsnummer
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
