import { useMemo, useState } from "react";
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
import Input from "components/form/Input";
import SortHeader from "../SortHeader";
import orderBy from "lodash.orderby";

type SortProperty = "grunnkretsnummer" | "navn";

const GrunnkretsPanel = ({ isOpen, className }: PanelProps) => {
  const [sortProperty, setSortProperty] =
    useState<SortProperty>("grunnkretsnummer");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const { t } = useTranslation();
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

  const onSort = (property: SortProperty) => {
    if (property === sortProperty) {
      if (sortOrder === "asc") {
        setSortOrder("desc");
      } else if (sortOrder === "desc") {
        // Hvis man har trykket på en knapp tre ganger går vi tilbake til start
        setSortProperty("grunnkretsnummer");
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
      {filteredGrunnkretser && (
        <KretsTable>
          <thead>
            <tr>
              <SortHeader {...sortHeaderProps("grunnkretsnummer")}>
                {t("grunnkrets.Grunnkretsnummer")}
              </SortHeader>
              <SortHeader {...sortHeaderProps("navn")}>
                {t("grunnkrets.Grunnkretsnavn")}
              </SortHeader>
              <th>{/* Tom plass for mellomrom */}</th>
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
