import styled from "styled-components";
import { map } from "../constants";
import Button from "components/Button";
import CustomControl from "components/CustomControl";
import { ReactComponent as Minus } from "icons/minus.svg";
import { ReactComponent as Plus } from "icons/pluss.svg";

const ZoomControls = () => {
  const zoom = (difference: number) => {
    const view = map.getView();
    view.animate({
      zoom: (view.getZoom() ?? 0) + difference,
      duration: 250,
    });
  };

  return (
    <>
      <CustomControl>
        <PlusZoomButton variant="icon" onClick={() => zoom(1)}>
          <Plus />
        </PlusZoomButton>
      </CustomControl>
      <CustomControl>
        <MinusZoomButton variant="icon" onClick={() => zoom(-1)}>
          <Minus />
        </MinusZoomButton>
      </CustomControl>
    </>
  );
};

const ZoomButton = styled(Button)`
  position: absolute;
  border-radius: 8px;
  background-color: white;
  border: 1px solid ${({ theme }) => theme.colors.blue};
  color: ${({ theme }) => theme.colors.blue};
  padding: 8px;
`;

const PlusZoomButton = styled(ZoomButton)`
  bottom: 24px;
  right: 80px;
`;

const MinusZoomButton = styled(ZoomButton)`
  bottom: 24px;
  right: 24px;
`;

export default ZoomControls;
