import styled from "styled-components";
import { map } from "../constants";
import Icon from "components/Icon";
import ControlButton from "./ControlButton";

const PanControls = () => {
  const pan = (x: number, y: number) => {
    const view = map.getView();
    const center = view.getCenter() ?? [0, 0];
    const mapUnitsDelta = (view.getResolution() ?? 1000) * 128;
    const newCenter = [
      center[0] + x * mapUnitsDelta,
      center[1] + y * mapUnitsDelta,
    ];
    view.animate({
      center: newCenter,
      duration: 100,
    });
  };

  return (
    <ControlGrid>
      <UpButton icon={<Icon icon="expand_less" />} onClick={() => pan(0, 1)} />
      <RightButton
        icon={<Icon icon="chevron_right" />}
        onClick={() => pan(1, 0)}
      />
      <DownButton
        icon={<Icon icon="expand_more" />}
        onClick={() => pan(0, -1)}
      />
      <LeftButton
        icon={<Icon icon="chevron_left" />}
        onClick={() => pan(-1, 0)}
      />
    </ControlGrid>
  );
};

const ControlGrid = styled.div`
  display: grid;
  grid-template-rows: repeat(3, auto);
  grid-template-columns: repeat(3, auto);
`;

const UpButton = styled(ControlButton)`
  grid-row: 1;
  grid-column: 2;
`;

const RightButton = styled(ControlButton)`
  grid-row: 2;
  grid-column: 3;
`;

const DownButton = styled(ControlButton)`
  grid-row: 3;
  grid-column: 2;
`;

const LeftButton = styled(ControlButton)`
  grid-row: 2;
  grid-column: 1;
`;

export default PanControls;
