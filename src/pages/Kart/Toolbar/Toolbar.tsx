import styled from "styled-components";
import { map } from "../constants";
import { Frame, toolbarSpacing } from "./components";
import ModeButton from "./ModeButton";
import { useEditAllGrenser } from "contexts/EditGrenserContext";
import { useOverlayPanel } from "contexts/OverlayPanelContext";
import { useToolbar } from "contexts/ToolbarContext";
import ToolbarTooltip from "./ToolbarTooltip";
import { Divider } from "@kvib/react";

const Container = styled.div`
  grid-area: toolbar;
  align-self: end;
  position: relative;
  margin: 16px;
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

const Toolbar = () => {
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

  const toggleKartlag = () => {
    if (activeOverlayPanel === "kartlag") {
      closeOverlayPanel();
    } else {
      openOverlayPanel("kartlag");
    }
  };

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

  return (
    <Container>
      <Buttons>
        {editingType && (
          <>
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
          </>
        )}
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
        <ModeButton
          icon="map"
          ariaLabel="Åpne kartlagsmenyen"
          isActive={activeOverlayPanel === "kartlag"}
          onClick={toggleKartlag}
        >
          Kartlag
        </ModeButton>
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
            <Divider orientation="vertical" />
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
            <Divider orientation="vertical" />
          </>
        )}

        {editingType && (
          <>
            <ToolbarTooltip text="Skru av/på snapping mot kartlag.">
              <ModeButton
                icon="magnet"
                ariaLabel="Snap til kartlag"
                isActive={activeEditModes.includes("snap")}
                onClick={() => toggleEditMode("snap")}
              >
                Snap
              </ModeButton>
            </ToolbarTooltip>
          </>
        )}
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

export default Toolbar;
