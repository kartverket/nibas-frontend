/* eslint-disable react/jsx-no-undef */
import { styled } from "styled-components";
import { map } from "../constants";
import { Frame, toolbarSpacing } from "./components";
import ModeButton from "./ModeButton";
import { useEditAllGrenser } from "contexts/EditGrenserContext";
import { useOverlayPanel } from "contexts/OverlayPanelContext";
import { useToolbar } from "contexts/ToolbarContext";
import ToolbarTooltip from "./ToolbarTooltip";
import {
  Divider,
  Icon,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
} from "@kvib/react";
import { useKeyboardShortcut } from "hooks/keyboard-shortcuts/keyboard-shortcuts-hook";

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
  justify-content: space-between;
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

  useKeyboardShortcut("add", () => togglePointMode("add"));
  useKeyboardShortcut("remove", () => togglePointMode("remove"));
  useKeyboardShortcut("edit", toggleMove);
  useKeyboardShortcut("snap", () => toggleEditMode("snap"));
  useKeyboardShortcut("merge", toggleMergePanel);
  useKeyboardShortcut("layers", toggleKartlag);

  return (
    <Container>
      <Buttons>
        <Menu autoSelect={false}>
          <MenuButton
            as={ModeButton}
            aria-label="Grenseverktøy"
            icon="show_chart"
          >
            Grense
          </MenuButton>
          <MenuList>
            <ToolMenuItem
              icon={<Icon icon="edit" />}
              $isActive={activePointMode === "draw"}
              onClick={() => togglePointMode("draw")}
            >
              Tegn ny grense
            </ToolMenuItem>

            <ToolMenuItem
              icon={<Icon icon="location_off" />}
              $isActive={activePointMode === "split"}
              onClick={() => togglePointMode("split")}
            >
              Splitt
            </ToolMenuItem>
            <ToolMenuItem
              icon={<Icon icon="location_off" />}
              $isActive={activePointMode === "metadata"}
              onClick={toggleMetadata}
            >
              Grenseinfo
            </ToolMenuItem>
          </MenuList>
        </Menu>
        <Menu autoSelect={false}>
          <MenuButton
            as={ModeButton}
            aria-label="Punktverktøy"
            icon="conversion_path"
          >
            Punkt
          </MenuButton>
          <MenuList>
            <ToolMenuItem
              icon={<Icon icon="edit_location_alt" />}
              $isActive={activePointMode === "detach"}
              onClick={() => togglePointMode("detach")}
            >
              Løsriv
            </ToolMenuItem>
          </MenuList>
        </Menu>
        <Menu autoSelect={false}>
          <MenuButton
            as={ModeButton}
            aria-label="Flateverktøy"
            icon="area_chart"
          >
            Flate
          </MenuButton>
          <MenuList>
            <ToolMenuItem
              icon={<Icon icon="edit_location_alt" />}
              $isActive={flatedetaljerIsActive}
              onClick={toggleFlatedetaljer}
            >
              Se/endre flatedetaljer
            </ToolMenuItem>
          </MenuList>
        </Menu>

        {editingType && (
          <>
            <ToolbarTooltip
              text="Flytt et punkt ved bruk av koordinater"
              shortcut="edit"
            >
              <ModeButton
                icon="ads_click"
                ariaLabel="Flytt punkt med koordinater"
                isActive={activePointMode === "koordinater"}
                onClick={toggleMove}
              >
                Flytt
              </ModeButton>
            </ToolbarTooltip>
            <ToolbarTooltip
              text="Legg til ett eller flere punkter på en grense."
              shortcut="add"
            >
              <ModeButton
                icon="add_location_alt"
                ariaLabel="Legg til punkter"
                isActive={activePointMode === "add"}
                onClick={() => togglePointMode("add")}
              >
                Legg til
              </ModeButton>
            </ToolbarTooltip>
            <ToolbarTooltip
              text="Fjern ett eller flere punkter fra en grense."
              shortcut="remove"
            >
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
        {flatedetaljerIsAvailable && (
          <>
            {mergeIsAvailable && (
              <ToolbarTooltip
                text="Slå sammen to eller flere stemmekretser."
                shortcut="merge"
              >
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
            <Divider orientation="vertical" />
          </>
        )}
        {editingType && (
          <>
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
  );
};

const ToolMenuItem = styled(MenuItem)<{ $isActive: boolean }>`
  background-color: ${(props) =>
    props.$isActive && "var(--kvib-colors-blue-50)"};
`;
export default Toolbar;
