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
import { Draw } from "ol/interaction";
import { useState } from "react";

import { useSidebarPanel } from "contexts/SidebarPanelContext";
import { useFeatureStyle } from "contexts/FeatureStyleContext";

const Toolbar = () => {
  const { activeTool, activeModeTools, toggleTool, toggleModeTool, enableModeTool, disableModeTool, resetTool } =
    useToolbar();
  const { activeOverlayPanel, openOverlayPanel, closeOverlayPanel } = useOverlayPanel();
  const { selectedFeatures, selectedPoint, selectFeatures, clearSelectedPoint } = useFeatureStyle();
  const { activeSidebarPanel, closeSidebarPanel } = useSidebarPanel();
  const { getCurrentlyEditingType } = useEditAllGrenser();
  const editingType = getCurrentlyEditingType();
  const isEditMode = !!editingType;

  const toggleGrenseinfo = () => {
    toggleTool("grenseinfo");

    if (activeOverlayPanel === "grenseinfo") {
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

  const isPanningAllowed = (): boolean => {
    if (!isEditMode) return false;

    const drawInteraction = map
      .getInteractions()
      .getArray()
      .find((interaction) => interaction instanceof Draw);

    if (activeTool === "draw" && !drawInteraction) return true;
    if (drawInteraction) {
      const revision = drawInteraction.getRevision();
      if (revision) {
        return revision === 0;
      }
    }

    return true;
  };

  const [panningEnabled, setPanningEnabled] = useState(true);

  addEventListener("mouseup", () => {
    if (activeTool == null || activeTool !== "draw") return;

    if (isPanningAllowed()) setPanningEnabled(true);
    else setPanningEnabled(false);
  });

  useKeyboardShortcut("layers", toggleKartlag);
  useKeyboardShortcut("move", () => enableModeTool("move"), panningEnabled);
  useKeyboardShortcut("edit", () => disableModeTool("move"), isEditMode);
  useKeyboardShortcut("matrikkel", () => toggleModeTool("matrikkel"));
  useKeyboardShortcut("grenseinfo", toggleGrenseinfo);
  useHoldButtonToggle(
    "alt",
    activeModeTools.includes("move"),
    () => enableModeTool("move"),
    () => disableModeTool("move"),
    isPanningAllowed,
  );

  // Alt her er en prioritert rekkefølge på hva som bør "exites" først. Det kan sikkert itereres litt på, men dette er et foreløpig forslag
  useKeyboardShortcut("escape", () => {
    if (activeTool === "draw") {
      const drawInteraction = map
        .getInteractions()
        .getArray()
        .find((interaction) => interaction instanceof Draw);
      if (drawInteraction) {
        const revision = drawInteraction.getRevision();
        if (revision && revision > 0) {
          const test = drawInteraction as Draw;
          test.abortDrawing();

          return;
        }
      }
    }

    if (activeOverlayPanel) {
      closeOverlayPanel();
      return;
    }

    if (activeSidebarPanel) {
      closeSidebarPanel();
      return;
    }

    if (!activeTool && activeModeTools.includes("matrikkel")) {
      toggleModeTool("matrikkel");
      return;
    }

    if (selectedPoint) {
      clearSelectedPoint();
      return;
    }

    if (selectedFeatures.length > 0) {
      selectFeatures([]);
      return;
    }

    resetTool();
  });

  return (
    <OuterContainer>
      <ToolbarPopups />
      <Container>
        <ToolbarButtons>
          <ToolbarButton
            icon="back_hand"
            onClick={() => enableModeTool("move")}
            isActive={activeModeTools.includes("move")}
            isDisabled={!panningEnabled}
            aria-label="Panorer i kartet"
            tooltip={{
              text: "Panorer i kartet",
              shortcut: "move",
              holdButton: "ALT-tasten",
              additionalInfo: "Hold inne Shift + marker i kartet for å zoome",
            }}
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
            isActive={activeTool === "grenseinfo"}
            onClick={toggleGrenseinfo}
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
  pointer-events: none !important;

  & > * {
    pointer-events: auto;
  }
`;

const Container = styled.div`
  display: flex;
  gap: 16px;
  pointer-events: none !important;

  & > * {
    pointer-events: auto;
  }
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
