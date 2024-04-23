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

type EpsgCode = `EPSG:${string}`;

type EpsgDefinition = {
  name: string;
  epsgCode: EpsgCode;
  def: string;
};

const epsgDefinitions: EpsgDefinition[] = [
  {
    name: "EUREF89 - UTM-sone 33",
    epsgCode: "EPSG:25833",
    def: "+proj=utm +zone=33 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs",
  },
  {
    name: "EUREF89 - Geografisk, grader (Lat/Lon)",
    epsgCode: "EPSG:4258",
    def: "+proj=longlat +ellps=GRS80 +no_defs +type=crs",
  },
  {
    name: "EPSG:3857 (Google Maps)",
    epsgCode: "EPSG:3857",
    def: "+proj=merc +a=6378137 +b=6378137 +lat_ts=0 +lon_0=0 +x_0=0 +y_0=0 +k=1 +units=m +nadgrids=@null +wktext +no_defs +type=crs",
  },
  {
    name: "EUREF89 - UTM-sone 31",
    epsgCode: "EPSG:25831",
    def: "+proj=utm +zone=31 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs",
  },
  {
    name: "EUREF89 - UTM-sone 32",
    epsgCode: "EPSG:25832",
    def: "+proj=utm +zone=32 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs",
  },
  {
    name: "EUREF89 - UTM-sone 34",
    epsgCode: "EPSG:25834",
    def: "+proj=utm +zone=34 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs",
  },
  {
    name: "EUREF89 - UTM-sone 35",
    epsgCode: "EPSG:25835",
    def: "+proj=utm +zone=35 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs",
  },
  {
    name: "EUREF89 - UTM-sone 36",
    epsgCode: "EPSG:25836",
    def: "+proj=utm +zone=36 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs",
  },
];

export const KoordinatSystemPanel = ({ isOpen }: PanelProps) => {
  const { closeOverlayModal } = useOverlayPanel();
  const [coordianteSystem, setCoordinateSystem] = useState("EPSG:25833");

  const setProjection = (selectedEpsgCode: string) => {
    setCoordinateSystem(selectedEpsgCode);
    const proj4Def = epsgDefinitions.find((epsgDef) => epsgDef.epsgCode === selectedEpsgCode)?.def;
    if (proj4Def != null) {
      // Registrerer projektsjonen i ol
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
          {epsgDefinitions.map((epsgDef) => (
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
