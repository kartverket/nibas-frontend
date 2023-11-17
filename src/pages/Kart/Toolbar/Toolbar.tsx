import { styled } from "styled-components";
import { map } from "../constants";
import ModeButton from "./ModeButton";
import { useEditAllGrenser } from "contexts/EditGrenserContext";
import { useOverlayPanel } from "contexts/OverlayPanelContext";
import { useToolbar } from "contexts/ToolbarContext";
import CustomTooltip from "./CustomTooltip";
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
          <CustomTooltip
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
          </CustomTooltip>
          <Divider orientation="vertical" />
          <ToolbarMenus />
          <Divider orientation="vertical" />
          <ModeButton
            icon="ssid_chart"
            ariaLabel="Vis grenser fra matrikkelen"
            isActive={activeEditModes.includes("matrikkel")}
            onClick={() => toggleEditMode("matrikkel")}
          >
            Matrikkel
          </ModeButton>
          <CustomTooltip
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
          </CustomTooltip>
        </ToolbarButtons>
        <ZoomButtons>
          <CustomTooltip text="Zoom inn på kartet" icon="add">
            <ModeButton
              icon="add"
              onClick={() => zoom(1)}
              ariaLabel="Zoom inn på kartet"
            />
          </CustomTooltip>
          <Divider />
          <CustomTooltip text="Zoom ut fra kartet" icon="remove">
            <ModeButton
              icon="remove"
              onClick={() => zoom(-1)}
              ariaLabel="Zoom ut på kartet"
            />
          </CustomTooltip>
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
  display: flex;
  gap: 24px;
  margin: 16px 0;
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
