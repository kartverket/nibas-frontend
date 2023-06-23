import { styled } from "styled-components";
import { map } from "../constants";
import { Frame, toolbarSpacing } from "./components";
import ModeButton from "./ModeButton";
import { useKeyboardShortcut } from "hooks/keyboard-shortcuts/keyboard-shortcuts-hook";
import { useEditAllGrenser } from "contexts/EditGrenserContext";
import { useOverlayPanel } from "contexts/OverlayPanelContext";
import { Divider, DividerVertical } from "components/Divider";
import { useToolbar } from "contexts/ToolbarContext";
import ToolbarTooltip from "./ToolbarTooltip";

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

// TODO: en eller annen måte å skjule knapper under en "mer"-meny ved mindre skjerm
// TODO: vurder om punkt og linje-knapper bør skjules inntil man er i redigeringsmodus
const ButtonToolbar = () => {
  const { undo, redo } = useToolbar();
  const { activePointMode, togglePointMode, activeEditModes, toggleEditMode } =
    useToolbar();
  const { getCurrentlyEditingType } = useEditAllGrenser();
  const editingType = getCurrentlyEditingType() as string;
  const { activeOverlayPanel, openOverlayPanel, closeOverlayPanel } =
    useOverlayPanel();
  const flatedetaljerIsAvailable =
    editingType === "grunnkrets" || editingType === "stemmekrets";
  const flatedetaljerIsActive =
    activeOverlayPanel === "grunnkrets" || activeOverlayPanel === "stemmekrets";
  const mergeIsAvailable = editingType === "stemmekrets";
  const mergeIsActive = activeOverlayPanel === "sammenslåing";

  const toggleMove = () => {
    togglePointMode("koordinater");

    if (activeOverlayPanel === "koordinater") {
      closeOverlayPanel();
    }
  };

  const toggleMetadata = () => {
    togglePointMode("metadata");

    if (activeOverlayPanel === "metadata") {
      closeOverlayPanel();
    }
  };

  const toggleFlatedetaljer = () => {
    if (flatedetaljerIsActive) {
      closeOverlayPanel();
    } else if (flatedetaljerIsAvailable) {
      openOverlayPanel(editingType);
    }
  };

  const toggleMergePanel = () => {
    if (mergeIsActive) {
      closeOverlayPanel();
    } else {
      openOverlayPanel("sammenslåing");
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
        <ToolbarTooltip text="Angrer forrige endring" shortcut="CTRL + Z">
          <ModeButton
            icon="undo"
            ariaLabel="Angre handling"
            onClick={undo}
            disabled={!undo}
          >
            Angre
          </ModeButton>
        </ToolbarTooltip>
        <ToolbarTooltip
          text="Gjør handling likevel"
          shortcut="CTRL + SHIFT + Z"
        >
          <ModeButton
            icon="redo"
            ariaLabel="Gjør om handling"
            onClick={redo}
            disabled={!redo}
          >
            Gjør om
          </ModeButton>
        </ToolbarTooltip>
        <DividerVertical />
        <ToolbarTooltip text="Flytt et punkt ved bruk av koordinater">
          <ModeButton
            icon="ads_click"
            ariaLabel="Flytt punkt med koordinater"
            isActive={activePointMode === "koordinater"}
            onClick={toggleMove}
          >
            Flytt
          </ModeButton>
        </ToolbarTooltip>
        <ToolbarTooltip text="Legg til ett eller flere punkter på en grense.">
          <ModeButton
            icon="add_location_alt"
            ariaLabel="Legg til punkter"
            isActive={activePointMode === "add"}
            onClick={() => togglePointMode("add")}
          >
            Legg til
          </ModeButton>
        </ToolbarTooltip>
        <ToolbarTooltip text="Fjern ett eller flere punkter fra en grense.">
          <ModeButton
            icon="wrong_location"
            ariaLabel="Fjern punkter"
            isActive={activePointMode === "remove"}
            onClick={() => togglePointMode("remove")}
          >
            Fjern
          </ModeButton>
        </ToolbarTooltip>
        <ToolbarTooltip text="Se og rediger informasjon om en grense. Trykk på grensen du ønsker å se informasjonen til.">
          <ModeButton
            icon="live_help"
            ariaLabel="Se informasjon om grensen"
            isActive={activePointMode === "metadata"}
            onClick={toggleMetadata}
          >
            Grenseinfo
          </ModeButton>
        </ToolbarTooltip>
        <DividerVertical />
        {flatedetaljerIsAvailable && (
          <>
            {mergeIsAvailable && (
              <ToolbarTooltip text="Slå sammen to eller flere stemmekretser.">
                <ModeButton
                  icon="merge"
                  ariaLabel="Slå sammen stemmekretser"
                  isActive={mergeIsActive}
                  onClick={toggleMergePanel}
                >
                  Slå sammen
                </ModeButton>
              </ToolbarTooltip>
            )}
            <ToolbarTooltip text="Vis informasjon om flatene innenfor den gitte inndelingen">
              <ModeButton
                icon="feed"
                ariaLabel="Vis informasjon om flatene"
                isActive={flatedetaljerIsActive}
                onClick={toggleFlatedetaljer}
              >
                Flateinfo
              </ModeButton>
            </ToolbarTooltip>
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
              Løsriv
            </ModeButton>
            <ModeButton
              icon="location_off"
              ariaLabel="Splitt punkter"
              isActive={activePointMode === "split"}
              onClick={() => togglePointMode("split")}
            >
              Splitt
            </ModeButton>
          </>
        )}
        <ToolbarTooltip text="Skru av/på snapping mot bakgrunnskart.">
          <ModeButton
            icon="magnet"
            ariaLabel="Snap til bakgrunnskart"
            isActive={activeEditModes.includes("snap")}
            onClick={() => toggleEditMode("snap")}
          >
            Snap
          </ModeButton>
        </ToolbarTooltip>
      </Buttons>
      <ZoomButtons>
        <ToolbarTooltip text="Zoom inn på kartet">
          <ModeButton
            icon="zoom_in"
            onClick={() => zoom(1)}
            ariaLabel="Zoom inn på kartet"
          />
        </ToolbarTooltip>
        <Divider />
        <ToolbarTooltip text="Zoom ut fra kartet">
          <ModeButton
            icon="zoom_out"
            onClick={() => zoom(-1)}
            ariaLabel="Zoom ut på kartet"
          />
        </ToolbarTooltip>
      </ZoomButtons>
    </Container>
  );
};

export default ButtonToolbar;
