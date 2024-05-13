import { useDisclosure } from "@kvib/react";
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
import { useFeatureStyle } from "contexts/FeatureStyleContext/FeatureStyleContext";
import { useInndelinger } from "contexts/InndelingerContext/InndelingerContext";
import { useUtkast } from "contexts/UtkastContext/UtkastContext";
import { anyFeatureIsEditable } from "utils/features";
import SnapMenu from "./SnapMenu";
import ZoomButtons from "./ZoomButtons";

const Toolbar = () => {
  const { utkast } = useUtkast();
  const { activeTool, activeModeTools, toggleTool, toggleModeTool, enableModeTool, disableModeTool, resetTool } =
    useToolbar();
  const {
    activeOverlayPanel,
    closeOverlayPanel,
    activeOverlayModal,
    closeOverlayModal,
    toggleOverlayPanel,
    toggleOverlayModal,
  } = useOverlayPanel();
  const { selectedFeatures, selectedPoint, clearSelectedPoint, clearSelection } = useFeatureStyle();

  const { inndelinger, currentlyEditedInndeling } = useInndelinger();
  const isEditing = currentlyEditedInndeling != null;
  const flatedataIsAvailable = Object.values(inndelinger).some((inndelingtype) => inndelingtype.size > 0);

  const { isOpen: isSnapMenuOpen, onClose: closeSnapMenu, onToggle: toggleSnapMenu } = useDisclosure();

  const toggleGrenseinfo = () => {
    toggleTool("grenseinfo");

    if (activeOverlayPanel === "grenseinfo") {
      closeOverlayPanel();
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

  const isPanningAllowed = (): boolean => {
    if (!isEditing) return false;

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

  useKeyboardShortcut("layers", () => toggleOverlayPanel("kartlag"));
  useKeyboardShortcut("move", () => enableModeTool("move"), panningEnabled);
  useKeyboardShortcut("edit", () => disableModeTool("move"), isEditing);
  useKeyboardShortcut("matrikkel", () => toggleModeTool("matrikkel"));
  useKeyboardShortcut("grenseinfo", toggleGrenseinfo);
  useKeyboardShortcut("goto", () => toggleOverlayModal("navigasjon"));
  useKeyboardShortcut("flatedata", () => toggleOverlayModal("flatedata"));
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

    if (activeOverlayModal === "navigasjon") {
      closeOverlayModal();
      return;
    }

    if (isSnapMenuOpen) {
      closeSnapMenu();
      return;
    }

    if (activeOverlayPanel) {
      closeOverlayPanel();
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
      clearSelection();
      return;
    }

    resetTool();
  });

  return (
    <OuterContainer>
      <ToolbarPopups />
      <Container>
        <ToolbarButtons>
          {utkast && (
            <>
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
                  aria-label="Flytt eller rediger grenser i kartet"
                  isDisabled={!isEditing || !anyFeatureIsEditable()}
                  tooltip={{ text: "Flytt eller rediger grenser i kartet", shortcut: "edit" }}
                >
                  Flytt / Rediger
                </ToolbarButton>
                <ToolbarMenus />
              </ConditionalHide>
            </>
          )}
          <ToolbarButton
            icon="search"
            isActive={activeOverlayModal === "navigasjon"}
            onClick={() => toggleOverlayModal("navigasjon")}
            aria-label="Gå til inndeling eller punkt i kartet"
            tooltip={{ text: "Gå til inndeling eller punkt i kartet", shortcut: "goto" }}
          >
            Gå til ...
          </ToolbarButton>
          <ToolbarButton
            icon="window"
            onClick={() => toggleOverlayModal("flatedata")}
            isActive={activeOverlayModal === "flatedata"}
            isDisabled={!flatedataIsAvailable}
            aria-label="Se eller endre flatedetaljer"
            tooltip={{
              text: "Se eller endre flatedetaljer",
              shortcut: "flatedata",
            }}
          >
            Flatedetaljer
          </ToolbarButton>

          <ToolbarButton
            icon="query_stats"
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
            onClick={() => toggleOverlayPanel("kartlag")}
            tooltip={{ text: "Legg til, endre rekkefølge og fjern kartlag fra kartet.", shortcut: "layers" }}
          >
            Kartlag
          </ToolbarButton>
          <ConditionalHide below="xl" condition={!!activeOverlayPanel}>
            <>
              <ToolbarButton
                icon="holiday_village"
                aria-label="Vis grenser fra matrikkelen"
                isActive={activeModeTools.includes("matrikkel")}
                onClick={toggleMatrikkel}
                tooltip={{ text: "Vis grenser fra matrikkelen", shortcut: "matrikkel" }}
              >
                Matrikkel
              </ToolbarButton>
              {utkast && <SnapMenu isOpen={isSnapMenuOpen} onClose={closeSnapMenu} onToggle={toggleSnapMenu} />}
            </>
          </ConditionalHide>
        </ToolbarButtons>
        <ZoomButtons />
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

export default Toolbar;
