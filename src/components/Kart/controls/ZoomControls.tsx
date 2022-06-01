import styled from "styled-components";
import { map } from "../constants";
import CustomControl from "components/CustomControl";
import Button from "components/form/Button";
import { ReactComponent as MinusIcon } from "icons/minusZoom.svg";
import { ReactComponent as PlusIcon } from "icons/plussZoom.svg";

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
        <PlusZoomButton
          icon={<PlusIcon />}
          onClick={() => zoom(1)}
        ></PlusZoomButton>
      </CustomControl>
      <CustomControl>
        <MinusZoomButton
          icon={<MinusIcon />}
          onClick={() => zoom(-1)}
        ></MinusZoomButton>
      </CustomControl>
    </>
  );
};

const ZoomButton = styled(Button).attrs(() => ({
  variant: "unstyled",
}))`
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
