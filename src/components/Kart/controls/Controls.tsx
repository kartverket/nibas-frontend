import styled from "styled-components";
import ZoomControls from "./ZoomControls";
import CustomControl from "./CustomControl";

const Controls = () => (
  <CustomControl>
    <ControlGrid>
      <ZoomControls />
    </ControlGrid>
  </CustomControl>
);

const ControlGrid = styled.div`
  position: absolute;
  top: 8px;
  right: 8px;
`;

export default Controls;
