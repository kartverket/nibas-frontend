import { Divider } from "@kvib/react";
import { useEditAllGrenser } from "contexts/EditGrenserContext";
import { useOverlayPanel } from "contexts/OverlayPanelContext";
import { useToolbar } from "contexts/ToolbarContext";
import {
  useHoldButtonToggle,
  useKeyboardShortcut,
} from "hooks/keyboard-shortcuts/keyboard-shortcuts-hook";
import { styled } from "styled-components";
import { getLayerById } from "utils/map/layers";
import { map } from "../constants";
import CustomTooltip from "./CustomTooltip";
import ModeButton from "./ModeButton";
import ToolbarMenus from "./ToolbarMenus";
import ToolbarPopups from "./ToolbarPopups";

const Toolbar = () => {
  const { activeModeTools, toggleModeTool, enableModeTool, disableModeTool } =
    useToolbar();
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

  const toggleMatrikkel = () => {
    if (activeModeTools.includes("matrikkel")) {
      const source = getLayerById("matrikkel").getSource();
      if (source) {
        source.clear(true);
      }
    }
    toggleModeTool("matrikkel");
  };

  const zoom = (difference: number) => {
    const view = map.getView();
    view.animate({
      zoom: (view.getZoom() ?? 0) + difference,
      duration: 250,
    });
  };

  useKeyboardShortcut("layers", toggleKartlag);
  useKeyboardShortcut("move", () => enableModeTool("move"));
  useKeyboardShortcut("edit", () => disableModeTool("move"), !!editingType);
  useKeyboardShortcut("matrikkel", () => toggleModeTool("matrikkel"));
  useHoldButtonToggle(
    " ",
    () => enableModeTool("move"),
    () => disableModeTool("move"),
    !!editingType,
  );

  return (
    <OuterContainer>
      <ToolbarPopups />
      <Container>
        <ToolbarButtons>
          <CustomTooltip
            text="Panorer i kartet"
            shortcut="move"
            holdButton="mellomromstasten"
          >
            <ModeButton
              icon="pan_tool"
              onClick={() => toggleModeTool("move")}
              isActive={activeModeTools.includes("move")}
              ariaLabel="Panorer i kartet"
            >
              Panorer
            </ModeButton>
          </CustomTooltip>
          <CustomTooltip text="Rediger grenser i kartet" shortcut="edit">
            <ModeButton
              icon="arrow_selector_tool"
              onClick={() => toggleModeTool("move")}
              isActive={!activeModeTools.includes("move")}
              ariaLabel="Rediger grenser i kartet"
              isDisabled={!editingType}
            >
              Rediger
            </ModeButton>
          </CustomTooltip>
          <Divider orientation="vertical" />
          <ToolbarMenus />
          <Divider orientation="vertical" />
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
          <ModeButton
            icon="holiday_village"
            ariaLabel="Vis grenser fra matrikkelen"
            isActive={activeModeTools.includes("matrikkel")}
            onClick={toggleMatrikkel}
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
              isActive={activeModeTools.includes("snap")}
              onClick={() => toggleModeTool("snap")}
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
  gap: 16px;
  margin-bottom: 16px;
`;

const Container = styled.div`
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
