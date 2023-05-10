import styled from "styled-components";
import { useTranslation } from "react-i18next";
import { map } from "../constants";
import { Frame, toolbarSpacing } from "./components";
import ModeButton from "./ModeButton";
import { useToolbar, useToolbarActions } from "contexts/ToolbarContext";
import { useKeyboardShortcut } from "hooks/keyboard-shortcuts/keyboard-shortcuts-hook";
import { useEditAllGrenser } from "contexts/EditGrenserContext";
import { useOverlayPanel } from "contexts/OverlayPanelContext";
import { Divider, DividerVertical } from "components/Divider";
import { useSidebarPanel } from "contexts/SidebarPanelContext";

const Container = styled.div`
  display: flex;
  gap: ${toolbarSpacing}px;
`;

const Buttons = styled(Frame)`
  padding: 16px 24px;
`;

const ZoomButtons = styled(Frame)`
  flex-direction: column;
  gap: 4px;
  padding: 8px 4px;
`;

// TODO: vurder om punkt og linje-knapper bør skjules inntil man er i redigeringsmodus
const ButtonToolbar = () => {
  const { t } = useTranslation();
  const { undo, redo } = useToolbarActions();
  const { activePointMode, togglePointMode, activeEditModes, toggleEditMode } =
    useToolbar();
  const { getCurrentlyEditingType } = useEditAllGrenser();
  const editingType = getCurrentlyEditingType() as string;
  const { activeOverlayPanel, setActiveOverlayPanel, closeOverlay } =
    useOverlayPanel();
  const { closeSidebar } = useSidebarPanel();
  const flatedetaljerIsAvailable =
    editingType === "grunnkrets" || editingType === "stemmekrets";
  const flatedetaljerIsActive =
    activeOverlayPanel === "grunnkrets" || activeOverlayPanel === "stemmekrets";
  const mergeIsAvailable = editingType === "stemmekrets";
  const mergeIsActive = activeOverlayPanel === "sammenslåing";

  const toggleMetadata = () => {
    togglePointMode("metadata");

    if (activeOverlayPanel === "metadata") {
      closeOverlay();
    }
  };

  const toggleFlatedetaljer = () => {
    if (flatedetaljerIsActive) {
      closeOverlay();
    } else if (flatedetaljerIsAvailable) {
      setActiveOverlayPanel(editingType);
    }
  };

  const toggleMergePanel = () => {
    if (mergeIsActive) {
      closeOverlay();
    } else {
      setActiveOverlayPanel("sammenslåing");
      closeSidebar();
    }
  };

  const zoom = (difference: number) => {
    const view = map.getView();
    view.animate({
      zoom: (view.getZoom() ?? 0) + difference,
      duration: 250,
    });
  };

  useKeyboardShortcut("undo", undo);
  useKeyboardShortcut("redo", redo);

  return (
    <Container>
      <Buttons>
        <ModeButton
          icon="undo"
          ariaLabel="Angre handling"
          onClick={undo}
          disabled={!undo}
        >
          {t("action.Undo")}
        </ModeButton>
        <ModeButton
          icon="redo"
          ariaLabel="Gjør om handling"
          onClick={redo}
          disabled={!redo}
        >
          {t("action.Redo")}
        </ModeButton>
        <DividerVertical />
        <ModeButton
          icon="add_location_alt"
          ariaLabel="Legg til punkter"
          isActive={activePointMode === "add"}
          onClick={() => togglePointMode("add")}
        >
          {t("action.Legg til")}
        </ModeButton>
        <ModeButton
          icon="wrong_location"
          ariaLabel="Fjern punkter"
          isActive={activePointMode === "remove"}
          onClick={() => togglePointMode("remove")}
        >
          {t("action.Fjern")}
        </ModeButton>
        <ModeButton
          icon="live_help"
          ariaLabel="Se metadata"
          isActive={activePointMode === "metadata"}
          onClick={toggleMetadata}
        >
          Metadata
        </ModeButton>
        <DividerVertical />
        {flatedetaljerIsAvailable && (
          <>
            {mergeIsAvailable && (
              <ModeButton
                icon="merge"
                ariaLabel="Slå sammen stemmekretser"
                isActive={mergeIsActive}
                onClick={toggleMergePanel}
              >
                Slå sammen
              </ModeButton>
            )}
            <ModeButton
              icon="feed"
              ariaLabel="Vis flatedetaljer"
              isActive={flatedetaljerIsActive}
              onClick={toggleFlatedetaljer}
            >
              Flatedetaljer
            </ModeButton>
            <DividerVertical />
          </>
        )}
        {false && (
          <>
            <ModeButton
              icon="edit_location_alt"
              ariaLabel="Løsriv punkter"
              isActive={activePointMode === "detach"}
              onClick={() => togglePointMode("detach")}
            >
              {t("action.Løsriv")}
            </ModeButton>
            <ModeButton
              icon="location_off"
              ariaLabel="Splitt punkter"
              isActive={activePointMode === "split"}
              onClick={() => togglePointMode("split")}
            >
              {t("action.Splitt")}
            </ModeButton>
          </>
        )}
        <ModeButton
          icon="magnet"
          ariaLabel="Snap til bakgrunnskart"
          isActive={activeEditModes.includes("snap")}
          onClick={() => toggleEditMode("snap")}
        >
          {t("action.Snap")}
        </ModeButton>
      </Buttons>
      <ZoomButtons>
        <ModeButton
          icon="zoom_in"
          onClick={() => zoom(1)}
          ariaLabel="Zoom inn på kartet"
        />
        <Divider />
        <ModeButton
          icon="zoom_out"
          onClick={() => zoom(-1)}
          ariaLabel="Zoom ut på kartet"
        />
      </ZoomButtons>
    </Container>
  );
};

export default ButtonToolbar;
