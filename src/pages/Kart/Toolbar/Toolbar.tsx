import { Divider } from "@kvib/react";
import { useEditAllGrenser } from "contexts/EditGrenserContext";
import { useOverlayPanel } from "contexts/OverlayPanelContext";
import { useToolbar } from "contexts/ToolbarContext";
import { useHoldButtonToggle, useKeyboardShortcut } from "hooks/keyboard-shortcuts/keyboard-shortcuts-hook";
import { styled } from "styled-components";
import { getLayerById } from "utils/map/layers";
import { map } from "../constants";
import ToolbarButton from "./ToolbarButton";
import ToolbarMenus from "./ToolbarMenus";
import ToolbarPopups from "./ToolbarPopups";
import { ConditionalHide } from "components/ConditionalShowHide";

const Toolbar = () => {
  const { activeTool, activeModeTools, toggleTool, toggleModeTool, enableModeTool, disableModeTool } = useToolbar();
  const { activeOverlayPanel, openOverlayPanel, closeOverlayPanel } = useOverlayPanel();
  const { getCurrentlyEditingType } = useEditAllGrenser();
  const editingType = getCurrentlyEditingType();
  const isEditMode = !!editingType;

  const toggleMetadata = () => {
    toggleTool("metadata");

    if (activeOverlayPanel === "metadata") {
      closeOverlayPanel();
    }
  };

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
  useKeyboardShortcut("edit", () => disableModeTool("move"), isEditMode);
  useKeyboardShortcut("matrikkel", () => toggleModeTool("matrikkel"));
  useKeyboardShortcut("grenseinfo", toggleMetadata);
  useHoldButtonToggle(
    "alt",
    activeModeTools.includes("move"),
    () => enableModeTool("move"),
    () => disableModeTool("move"),
    isEditMode,
  );

  return (
    <OuterContainer>
      <ToolbarPopups />
      <Container>
        <ToolbarButtons>
          <ToolbarButton
            icon="back_hand"
            onClick={() => enableModeTool("move")}
            isActive={activeModeTools.includes("move")}
            aria-label="Panorer i kartet"
            tooltip={{ text: "Panorer i kartet", shortcut: "move", holdButton: "ALT-tasten" }}
          >
            Panorer
          </ToolbarButton>
          <ConditionalHide below="xl" condition={!!activeOverlayPanel}>
            <ToolbarButton
              icon="arrow_selector_tool"
              onClick={() => disableModeTool("move")}
              isActive={!activeModeTools.includes("move")}
              aria-label="Rediger grenser i kartet"
              isDisabled={!editingType}
              tooltip={{ text: "Rediger grenser i kartet", shortcut: "edit" }}
            >
              Rediger
            </ToolbarButton>
            <ToolbarMenus />
          </ConditionalHide>
          <ToolbarButton
            icon="live_help"
            isActive={activeTool === "metadata"}
            onClick={toggleMetadata}
            aria-label="Se informasjon om grensen"
            tooltip={{ text: "Se informasjon om grensen", shortcut: "grenseinfo" }}
          >
            Informasjon
          </ToolbarButton>
          <ToolbarButton
            icon="map"
            aria-label="Åpne kartlagsmenyen"
            isActive={activeOverlayPanel === "kartlag"}
            onClick={toggleKartlag}
            tooltip={{ text: "Legg til, endre rekkefølge og fjern kartlag fra kartet.", shortcut: "layers" }}
          >
            Kartlag
          </ToolbarButton>
          <ToolbarButton
            icon="holiday_village"
            aria-label="Vis grenser fra matrikkelen"
            isActive={activeModeTools.includes("matrikkel")}
            onClick={toggleMatrikkel}
            tooltip={{ text: "Vis grenser fra matrikkelen", shortcut: "matrikkel" }}
          >
            Matrikkel
          </ToolbarButton>
          <ConditionalHide below="xl" condition={!!activeOverlayPanel}>
            <ToolbarButton
              icon="layers"
              aria-label="Snap til kartlag"
              isActive={activeModeTools.includes("snap")}
              onClick={() => toggleModeTool("snap")}
              isDisabled={!editingType}
              tooltip={{ text: "Skru av/på snapping mot kartlag.", shortcut: "snap" }}
            >
              Snap
            </ToolbarButton>
          </ConditionalHide>
        </ToolbarButtons>
        <ZoomButtons>
          <ToolbarButton
            icon="add"
            onClick={() => zoom(1)}
            aria-label="Zoom inn på kartet"
            tooltip={{ text: "Zoom inn på kartet" }}
          />
          <Divider />
          <ToolbarButton
            icon="remove"
            onClick={() => zoom(-1)}
            aria-label="Zoom ut fra kartet"
            tooltip={{ text: "Zoom ut fra kartet" }}
          />
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
  margin-bottom: 32px;
  pointer-events: none;

  & > * {
    pointer-events: auto;
  }
`;

const Container = styled.div`
  display: flex;
  gap: 16px;
`;

const ToolbarButtons = styled.div`
  display: flex;
  align-items: center;
  gap: 28px;

  width: fit-content;
  padding: 16px 20px;
  background: white;
  border-radius: 10px;
  box-shadow: var(--kvib-shadows-base);
`;

const ZoomButtons = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  width: fit-content;
  border-radius: 10px;
  background: white;
  box-shadow: var(--kvib-shadows-base);
`;

export default Toolbar;
