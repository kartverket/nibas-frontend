import { styled } from "styled-components";
import { map } from "../constants";
import ModeButton from "./ModeButton";
import { useEditAllGrenser } from "contexts/EditGrenserContext";
import { useOverlayPanel } from "contexts/OverlayPanelContext";
import { useToolbar } from "contexts/ToolbarContext";
import ToolbarTooltip from "./ToolbarTooltip";
import { Divider } from "@kvib/react";
import { useKeyboardShortcut } from "hooks/keyboard-shortcuts/keyboard-shortcuts-hook";
import ToolbarPopups from "./ToolbarPopups";
import ToolbarMenus from "./ToolbarMenus";

const Toolbar = () => {
  const { activeEditModes, toggleEditMode } = useToolbar();
  const { getCurrentlyEditingType } = useEditAllGrenser();
  const editingType = getCurrentlyEditingType();
  const { activeOverlayPanel, openOverlayPanel, closeOverlayPanel } =
    useOverlayPanel();

  const toggleKartlag = () => {
    if (activeOverlayPanel === "kartlag") {
      closeOverlayPanel();
    } else {
      openOverlayPanel("kartlag");
    }
  };

  const zoom = (difference: number) => {
    const view = map.getView();
    view.animate({
      zoom: (view.getZoom() ?? 0) + difference,
      duration: 250,
    });
  };

  useKeyboardShortcut("layers", toggleKartlag);

  return (
    <OuterContainer>
      <ToolbarPopups />
      <Container>
        <ToolbarButtons>
          <ToolbarTooltip
            text="Legg til, endre rekkefølge og fjern kartlag fra kartet."
            shortcut="layers"
          >
            <ModeButton
              icon="map"
              ariaLabel="Åpne kartlagsmenyen"
              isActive={activeOverlayPanel === "kartlag"}
              onClick={toggleKartlag}
            >
              Kartlag
            </ModeButton>
          </ToolbarTooltip>
          <Divider orientation="vertical" />
          <ToolbarMenus />
          <Divider orientation="vertical" />
          <ToolbarTooltip
            text="Skru av/på snapping mot kartlag."
            shortcut="snap"
          >
            <ModeButton
              icon="layers"
              ariaLabel="Snap til kartlag"
              isActive={activeEditModes.includes("snap")}
              onClick={() => toggleEditMode("snap")}
              isDisabled={!editingType}
            >
              Snap
            </ModeButton>
          </ToolbarTooltip>
        </ToolbarButtons>
        <ZoomButtons>
          <ToolbarTooltip text="Zoom inn på kartet">
            <ModeButton
              icon="add"
              onClick={() => zoom(1)}
              ariaLabel="Zoom inn på kartet"
            />
          </ToolbarTooltip>
          <Divider />
          <ToolbarTooltip text="Zoom ut fra kartet">
            <ModeButton
              icon="remove"
              onClick={() => zoom(-1)}
              ariaLabel="Zoom ut på kartet"
            />
          </ToolbarTooltip>
        </ZoomButtons>
      </Container>
    </OuterContainer>
  );
};

const OuterContainer = styled.div`
  grid-area: toolbar;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Container = styled.div`
  grid-area: toolbar;
  align-self: end;
  position: relative;
  margin: 16px 0;
  display: flex;
  gap: 24px;
`;

const ToolbarButtons = styled.div`
  display: flex;
  gap: 32px;

  width: fit-content;
  padding: 16px 24px;
  background: white;
  border-radius: 10px;
  box-shadow: var(--kvib-shadows-base);
`;

const ZoomButtons = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  justify-content: space-between;

  width: fit-content;
  border-radius: 10px;
  background: white;
  box-shadow: var(--kvib-shadows-base);
  padding: 8px 4px;
`;

export default Toolbar;
