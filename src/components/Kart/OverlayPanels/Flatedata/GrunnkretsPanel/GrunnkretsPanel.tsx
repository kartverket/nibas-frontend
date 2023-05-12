import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
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
  const { flatedata, closeOverlay } = useOverlayPanel();
  const { searchValue } = useSearch();
  const [activeEditingGrunnkrets, setActiveEditingGrunnkrets] =
    useState<GrunnkretsResponse | null>(null);

  // TODO: sorter etter navn eller nummer
  const kommuneId = flatedata ? getIdFromEntity(flatedata) : "";
  const { data: grunnkretserByKommune } = useKommuneGrunnkretser(kommuneId);
  const utkastGrunnkretser = useUtkastEntity(
    grunnkretserByKommune,
    "grunnkretsendringer"
  ) as GrunnkretsResponse[] | undefined;

  // TODO: sjekk om søk fortsatt skal være en greie
  const filteredGrunnkretser = useMemo(() => {
    if (!searchValue) return utkastGrunnkretser;

    return utkastGrunnkretser?.filter(
      (grunnkrets) =>
        grunnkrets.grunnkretsnummer.includes(searchValue) ||
        grunnkrets.navn.toLowerCase().includes(searchValue.toLowerCase())
    );
  }, [searchValue, utkastGrunnkretser]);

  //const formMethods = useForm<Inputs>();
  //const { handleSubmit, getValues } = formMethods;

  if (!flatedata) {
    return null;
  }

  // TODO: legg til form her også
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
                isEditing={
                  activeEditingGrunnkrets
                    ? getIdFromEntity(grunnkrets) ===
                      getIdFromEntity(activeEditingGrunnkrets)
                    : false
                }
                setActiveEditingGrunnkrets={setActiveEditingGrunnkrets}
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
