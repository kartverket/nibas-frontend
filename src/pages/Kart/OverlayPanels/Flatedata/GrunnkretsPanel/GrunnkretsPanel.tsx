import { useMemo } from "react";
import GrunnkretsRow from "./GrunnkretsRow";
import { useUtkast, useUtkastEntity } from "contexts/UtkastContext";
import useSearch from "hooks/useSearch";
import { GrunnkretsResponse } from "types/api";
import { getIdFromEntity } from "utils/api";
import { useOverlayPanel } from "contexts/OverlayPanelContext";
import { Panel, PanelHeader, PanelProps } from "../../Panel";
import { KretsTable } from "../KretsTable";
import { useKommuneGrunnkretser } from "hooks/inndelinger/useGrunnkretser";
import Input from "components/Input";
import SortHeader from "../SortHeader";
import { useTableSort } from "../useTableSort";
import { orderBy } from "utils/list-utils";
import { getNavnInSpraak } from "utils/language/language";

const GrunnkretsPanel = ({ isOpen, className }: PanelProps) => {
  const { utkast } = useUtkast();
  const { sortProperty, sortOrder, sortHeaderProps } = useTableSort([
    "grunnkretsnummer",
    "navn",
  ]);
  const { flatedata, closeOverlayPanel } = useOverlayPanel();
  const { searchValue, setInputValue } = useSearch();

  const kommuneId = flatedata ? getIdFromEntity(flatedata) : "";
  const { data: grunnkretserByKommune } = useKommuneGrunnkretser(kommuneId);
  const utkastGrunnkretser = useUtkastEntity(
    grunnkretserByKommune,
    "grunnkretsendringer"
  ) as GrunnkretsResponse[] | undefined;

  const filteredGrunnkretser = useMemo(() => {
    if (!searchValue) return utkastGrunnkretser;

    return utkastGrunnkretser?.filter(
      (grunnkrets) =>
        grunnkrets.grunnkretsnummer.includes(searchValue) ||
        grunnkrets.navn.toLowerCase().includes(searchValue.toLowerCase())
    );
  }, [searchValue, utkastGrunnkretser]);

  return (
    <Panel $isOpen={isOpen} className={className}>
      <PanelHeader onClose={closeOverlayPanel}>
        Flateinformasjon for {getNavnInSpraak(flatedata?.navn, "nor")}
      </PanelHeader>
      {filteredGrunnkretser && (
        <KretsTable $hasUtkast={utkast !== undefined}>
          <thead>
            <tr>
              <SortHeader {...sortHeaderProps("grunnkretsnummer")}>
                Grunnkretsnummer
              </SortHeader>
              <SortHeader {...sortHeaderProps("navn")}>
                Grunnkretsnavn
              </SortHeader>
              {utkast && <th>{/* Tom plass for mellomrom */}</th>}
              <th>
                <Input
                  placeholder="Søk på navn"
                  onChange={(e) => setInputValue(e.currentTarget.value)}
                />
              </th>
            </tr>
          </thead>
          <tbody>
            {orderBy(filteredGrunnkretser, sortProperty, sortOrder).map(
              (grunnkrets) => (
                <GrunnkretsRow
                  key={getIdFromEntity(grunnkrets)}
                  grunnkrets={grunnkrets}
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

export default GrunnkretsPanel;
