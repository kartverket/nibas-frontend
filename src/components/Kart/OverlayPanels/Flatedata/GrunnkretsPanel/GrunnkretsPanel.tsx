import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import GrunnkretsRow from "./GrunnkretsRow";
import { useUtkastEntity } from "contexts/UtkastContext";
import useSearch from "hooks/useSearch";
import { GrunnkretsResponse } from "types/api";
import { getIdFromEntity } from "utils/api";
import { useOverlayPanel } from "contexts/OverlayPanelContext";
import { Panel, PanelHeader, PanelProps } from "../../Panel";
import { KretsTable } from "../KretsTable";
import { useKommuneGrunnkretser } from "hooks/inndelinger/useGrunnkretser";

const GrunnkretsPanel = ({ isOpen, className }: PanelProps) => {
  const { t } = useTranslation();
  const { flatedata, closeOverlayPanel } = useOverlayPanel();
  const { searchValue } = useSearch();

  const kommuneId = flatedata ? getIdFromEntity(flatedata) : "";
  const { data: grunnkretserByKommune } = useKommuneGrunnkretser(kommuneId);
  const utkastGrunnkretser = useUtkastEntity(
    grunnkretserByKommune,
    "grunnkretsendringer"
  ) as GrunnkretsResponse[] | undefined;

  // TODO: reintroduser søk
  const filteredGrunnkretser = useMemo(() => {
    if (!searchValue) return utkastGrunnkretser;

    return utkastGrunnkretser?.filter(
      (grunnkrets) =>
        grunnkrets.grunnkretsnummer.includes(searchValue) ||
        grunnkrets.navn.toLowerCase().includes(searchValue.toLowerCase())
    );
  }, [searchValue, utkastGrunnkretser]);

  const sortByGrunnkretsnummer = (
    a: GrunnkretsResponse,
    b: GrunnkretsResponse
  ) => parseInt(a.grunnkretsnummer) - parseInt(b.grunnkretsnummer);

  return (
    <Panel isOpen={isOpen} className={className}>
      <PanelHeader onClose={closeOverlayPanel}>Endre kretsdetaljer</PanelHeader>
      {filteredGrunnkretser && (
        <KretsTable>
          <thead>
            <tr>
              <th>{t("grunnkrets.Grunnkretsnummer")}</th>
              <th>{t("grunnkrets.Grunnkretsnavn")}</th>
              <th>{/* Tom plass for mellomrom */}</th>
              <th>{/* Tom plass for knapp i rader */}</th>
            </tr>
          </thead>
          <tbody>
            {filteredGrunnkretser
              .sort(sortByGrunnkretsnummer)
              .map((grunnkrets) => (
                <GrunnkretsRow
                  key={getIdFromEntity(grunnkrets)}
                  grunnkrets={grunnkrets}
                  kommuneId={kommuneId}
                />
              ))}
          </tbody>
        </KretsTable>
      )}
    </Panel>
  );
};

export default GrunnkretsPanel;
