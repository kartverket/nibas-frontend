import { styled } from "styled-components";
import { map } from "../constants";
import { Frame, toolbarSpacing } from "./components";
import ModeButton from "./ModeButton";
import { useEditAllGrenser } from "contexts/EditGrenserContext";
import { useOverlayPanel } from "contexts/OverlayPanelContext";
import { useToolbar } from "contexts/ToolbarContext";
import ToolbarTooltip from "./ToolbarTooltip";
import {
  Button,
  Divider,
  Icon,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
} from "@kvib/react";
import { useKeyboardShortcut } from "hooks/keyboard-shortcuts/keyboard-shortcuts-hook";
import {
  SelectedFeatures,
  useFeatureStyle,
} from "contexts/FeatureStyleContext";
import { grenseStyles } from "utils/map/layerStyles";
import { LineString } from "ol/geom";
import { Feature } from "ol";
import useDirtyStyles from "contexts/FeatureStyleContext/useDirtyStyles";
import { getFeatureId } from "utils/map/source";
import { arch } from "os";

const Container = styled.div`
  grid-area: toolbar;
  align-self: end;
  position: relative;
  margin: 16px 0;
  display: flex;
  gap: ${toolbarSpacing}px;
`;

const Buttons = styled(Frame)`
  padding: 16px 24px;

  * {
    margin: 0 8px;
  }
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
  const editingType = getCurrentlyEditingType();
  const { activeOverlayPanel, openOverlayPanel, closeOverlayPanel } =
    useOverlayPanel();
  const flatedetaljerIsActive =
    activeOverlayPanel === "grunnkrets" || activeOverlayPanel === "stemmekrets";
  const mergeIsActive = activeOverlayPanel === "sammenslåing";

  const { selectedFeatures } = useFeatureStyle();
  const { setArchivedFeatures } = useDirtyStyles();

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
    } else if (editingType === "grunnkrets" || editingType === "stemmekrets") {
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

  const archiveFeatures = (features: Feature<LineString>[]) => {
    setArchivedFeatures(features.map((feature) => getFeatureId(feature)));
  };

  useKeyboardShortcut("add", () => togglePointMode("add"));
  useKeyboardShortcut("remove", () => togglePointMode("remove"));
  useKeyboardShortcut("edit", toggleMove);
  useKeyboardShortcut("snap", () => toggleEditMode("snap"));
  useKeyboardShortcut("merge", toggleMergePanel);
  useKeyboardShortcut("layers", toggleKartlag);

  return (
    <ToolbarMenu>
      {activePointMode === "archive" && (
        <ToolPopup>
          <ToolPopupText>Velg grensen du ønsker å arkivere</ToolPopupText>
          <Button
            size="sm"
            isDisabled={selectedFeatures.length === 0}
            onClick={() => archiveFeatures(selectedFeatures)}
          >
            Arkiver grense
          </Button>
        </ToolPopup>
      )}
      <Container>
        <Buttons>
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
          <Menu autoSelect={false}>
            <MenuButton
              as={ModeButton}
              aria-label="Grenseverktøy"
              icon="show_chart"
              isDisabled={!editingType}
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
                Splitt grense
              </ToolMenuItem>
              <ToolMenuItem
                icon={<Icon icon="edit_location_alt" />}
                $isActive={activePointMode === "detach"}
                onClick={() => togglePointMode("detach")}
              >
                Løsriv grense
              </ToolMenuItem>
              <ToolMenuItem
                icon={<Icon icon="live_help" />}
                aria-label="Se informasjon om grensen"
                $isActive={activePointMode === "metadata"}
                onClick={toggleMetadata}
              >
                Se/endre grenseinformasjon
              </ToolMenuItem>
              <ToolMenuItem
                icon={<Icon icon="archive" />}
                aria-label="Arkiver grense"
                $isActive={activePointMode === "archive"}
                onClick={() => togglePointMode("archive")}
              >
                Arkiver grense
              </ToolMenuItem>
            </MenuList>
          </Menu>
          <Menu autoSelect={false}>
            <MenuButton
              as={ModeButton}
              aria-label="Punktverktøy"
              icon="conversion_path"
              isDisabled={!editingType}
            >
              Punkt
            </MenuButton>
            <MenuList>
              <ToolMenuItem
                icon={<Icon icon="ads_click" />}
                ariaLabel="Flytt punkt med koordinater"
                $isActive={activePointMode === "koordinater"}
                onClick={toggleMove}
              >
                Flytt punkt med koordinater
              </ToolMenuItem>
              <ToolMenuItem
                icon={<Icon icon="add_location_alt" />}
                ariaLabel="Legg til punkter"
                $isActive={activePointMode === "add"}
                onClick={() => togglePointMode("add")}
              >
                Legg til punkt
              </ToolMenuItem>
              <ToolMenuItem
                icon={<Icon icon="wrong_location" />}
                ariaLabel="Fjern punkter"
                $isActive={activePointMode === "remove"}
                onClick={() => togglePointMode("remove")}
              >
                Fjern punkt
              </ToolMenuItem>
            </MenuList>
          </Menu>
          <Menu autoSelect={false}>
            <MenuButton
              as={ModeButton}
              aria-label="Flateverktøy"
              icon="area_chart"
              isDisabled={!editingType}
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
              <ToolMenuItem
                icon={<Icon icon="merge" />}
                aria-label="Slå sammen stemmekretser"
                $isActive={mergeIsActive}
                isDisabled={editingType !== "stemmekrets"}
                onClick={toggleMergePanel}
              >
                Slå sammen flater
              </ToolMenuItem>
            </MenuList>
          </Menu>
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
    </ToolbarMenu>
  );
};

const ToolMenuItem = styled(MenuItem)<{ $isActive: boolean }>`
  background-color: ${(props) =>
    props.$isActive && "var(--kvib-colors-blue-50)"};
`;

const ToolbarMenu = styled.div`
  grid-area: toolbar;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const ToolPopup = styled.div`
  display: flex;
  justify-content: space-between;
  width: 450px;
  align-items: center;
  padding: 12px;
  border-radius: 8px;
  background: var(--kvib-colors-chakra-body-bg);
  box-shadow: var(--kvib-shadows-base);
  border: 2px solid transparent;
  transition: border-color 0.1s;
  cursor: pointer;
  font-size: 16px;
`;

const ToolPopupText = styled.div`
  font-size: 18px;
`;

export default Toolbar;
