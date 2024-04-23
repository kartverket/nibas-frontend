import { CloseButton, Select, Text } from "@kvib/react";
import { useOverlayPanel } from "contexts/OverlayPanelContext";
import { View } from "ol";
import { get as getProjection } from "ol/proj.js";
import { register } from "ol/proj/proj4";
import proj4 from "proj4";
import { keyframes, styled } from "styled-components";
import { map } from "../constants";
import { AbsolutePanel, PanelProps } from "./Panel";
import { useState } from "react";
import { projectionDefinitions } from "utils/map/projections";

export const KoordinatsystemPanel = ({ isOpen }: PanelProps) => {
  const { closeOverlayModal } = useOverlayPanel();
  const [coordianteSystem, setCoordinateSystem] = useState("EPSG:25833");

  const setProjection = (selectedEpsgCode: string) => {
    setCoordinateSystem(selectedEpsgCode);
    const proj4Def = projectionDefinitions.find((epsgDef) => epsgDef.epsgCode === selectedEpsgCode)?.def;
    if (proj4Def != null) {
      proj4.defs(selectedEpsgCode, proj4Def);
      register(proj4);

      const projection = getProjection(selectedEpsgCode);
      if (projection != null) {
        const currentView = map.getView();
        map.setView(
          new View({
            zoom: currentView.getZoom(),
            minZoom: currentView.getMinZoom(),
            maxZoom: currentView.getMaxZoom(),
            center: currentView.getCenter(),
            projection: projection,
          }),
        );
        closeOverlayModal();
      }
    }
  };

  return (
    <Container $isOpen={isOpen}>
      <AbsoluteCloseButton onClick={() => closeOverlayModal()} aria-label="Lukk" size={"sm"} />
      <Wrapper>
        <Text as={"b"} fontSize={"lg"}>
          Koordinatsystem
        </Text>
        <Select
          value={coordianteSystem}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setProjection(e.target.value)}
        >
          {projectionDefinitions.map((epsgDef) => (
            <option value={epsgDef.epsgCode} key={epsgDef.epsgCode}>
              {epsgDef.name}
            </option>
          ))}
        </Select>
      </Wrapper>
    </Container>
  );
};

const AbsoluteCloseButton = styled(CloseButton)`
  position: absolute;
  right: 8px;
  top: 8px;
`;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translate(-100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const Container = styled(AbsolutePanel)`
  top: 48px;
  left: 8px;
  padding: 16px;
  width: 340px;
  max-width: unset;
  margin: unset;
  animation: ${fadeIn} 0.25s ease-in-out;
  border-radius: 8px;
  transform: translateX(0);
`;
