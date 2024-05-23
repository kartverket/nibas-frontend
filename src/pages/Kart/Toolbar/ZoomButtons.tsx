import { styled } from "styled-components";
import ToolbarButton from "./ToolbarButton";
import { Divider } from "@kvib/react";
import { map } from "../constants";

const zoom = (difference: number) => {
  const view = map.getView();
  view.animate({
    zoom: (view.getZoom() ?? 0) + difference,
    duration: 250,
  });
};

const ZoomButtons = () => {
  return (
    <Container>
      <ToolbarButton
        icon="add"
        onClick={() => zoom(1)}
        variant="tertiary"
        aria-label="Zoom inn på kartet"
        tooltip={{ text: "Zoom inn på kartet" }}
      />
      <Divider />
      <ToolbarButton
        icon="remove"
        onClick={() => zoom(-1)}
        variant="tertiary"
        aria-label="Zoom ut fra kartet"
        tooltip={{ text: "Zoom ut fra kartet" }}
      />
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  width: fit-content;
  border-radius: 10px;
  background: white;
  box-shadow: var(--kvib-shadows-sm);
`;

export default ZoomButtons;
