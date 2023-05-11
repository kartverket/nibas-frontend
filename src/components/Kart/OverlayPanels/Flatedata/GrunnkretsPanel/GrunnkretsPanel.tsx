import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import GrunnkretsRow from "./GrunnkretsRow";
import { useUtkastEntity } from "contexts/UtkastContext";
import useNibasApi from "hooks/useNibasApi";
import useSearch from "hooks/useSearch";
import { GrunnkretsRef } from "types/api";
import { sortGrenserAlphabetically } from "utils/language/language";
import { getIdFromEntity } from "utils/api";
import { useOverlayPanel } from "contexts/OverlayPanelContext";
import { Panel, PanelHeader, PanelProps } from "../../Panel";
import { KretsTable } from "../KretsTable";

const GrunnkretsPanel = ({ isOpen, className }: PanelProps) => {
  const { flatedata, closeOverlay } = useOverlayPanel();
  const kommuneId = flatedata ? getIdFromEntity(flatedata) : "";
  const { t } = useTranslation();
  const { searchValue } = useSearch();

  const { data: grunnkretserByKommune } = useNibasApi(
    kommuneId ? "/v1/kommuner/{id}/grunnkretser" : null,
    {
      id: kommuneId,
    }
  );

  const sortedGrunnkretser = useMemo(
    () => sortGrenserAlphabetically(grunnkretserByKommune),
    [grunnkretserByKommune]
  );

  const utkastGrunnkretser = useUtkastEntity(
    sortedGrunnkretser,
    "grunnkretsendringer"
  ) as GrunnkretsRef[] | undefined;

  // TODO: sjekk om søk fortsatt skal være en greie
  const filteredGrunnkretser = useMemo(() => {
    if (!searchValue) return utkastGrunnkretser;

    return utkastGrunnkretser?.filter(
      (grunnkrets) =>
        grunnkrets.grunnkretsnummer.includes(searchValue) ||
        grunnkrets.navn.toLowerCase().includes(searchValue.toLowerCase())
    );
  }, [searchValue, utkastGrunnkretser]);

  if (!flatedata) {
    return null;
  }

  // TODO: legg til fremtidige endringer igjen
  return (
    <Panel isOpen={isOpen} className={className}>
      <PanelHeader onClose={closeOverlay}>Endre kretsdetaljer</PanelHeader>
      {filteredGrunnkretser && (
        <KretsTable>
          <thead>
            <tr>
              <GrunnkretsnummerColumn>
                {t("grunnkrets.Grunnkretsnummer")}
              </GrunnkretsnummerColumn>
              <GrunnkretsnavnColumn>
                {t("grunnkrets.Grunnkretsnavn")}
              </GrunnkretsnavnColumn>
              <Remainder />
              <th>{/* Tom plass for knapp i rader */}</th>
            </tr>
          </thead>
          <tbody>
            {filteredGrunnkretser.map((grunnkrets) => (
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

// TODO: sjekk om de greiene her kan droppes, om det finnes en bedre løsning
const GrunnkretsnummerColumn = styled.th`
  width: 25%;
`;

const GrunnkretsnavnColumn = styled.th`
  width: 25%;
`;

const Remainder = styled.th`
  width: 100%;
`;

export default GrunnkretsPanel;
