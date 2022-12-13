import styled from "styled-components";
import PanControls from "./PanControls";
import ZoomControls from "./ZoomControls";
import CustomControl from "./CustomControl";

const Controls = () => (
  <CustomControl>
    <ControlGrid>
      <ZoomControls />
      <PanControls />
    </ControlGrid>
  </CustomControl>
);

const ControlGrid = styled.div`
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  gap: 32px;
`;

export default Controls;
