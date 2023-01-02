import styled from "styled-components";
import { map } from "../constants";
import Icon from "components/Icon";
import ControlButton from "./ControlButton";

const ZoomControls = () => {
  const zoom = (difference: number) => {
    const view = map.getView();
    view.animate({
      zoom: (view.getZoom() ?? 0) + difference,
      duration: 250,
    });
  };

  return (
    <ControlGrid>
      <ControlButton
        icon={<Icon icon="zoom_in" />}
        onClick={() => zoom(1)}
        aria-label={`Zoom inn på kartet`}
      />
      <ControlButton
        icon={<Icon icon="zoom_out" />}
        onClick={() => zoom(-1)}
        aria-label={`Zoom ut på kartet`}
      />
    </ControlGrid>
  );
};

const ControlGrid = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 8px;
`;

export default ZoomControls;
