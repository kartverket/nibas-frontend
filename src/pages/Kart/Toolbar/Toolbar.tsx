import { styled } from "styled-components";
import { map } from "../constants";
import ModeButton from "./ModeButton";
import { useEditAllGrenser } from "contexts/EditGrenserContext";
import { useOverlayPanel } from "contexts/OverlayPanelContext";
import { useToolbar } from "contexts/ToolbarContext";
import ToolbarTooltip from "./ToolbarTooltip";
import {
  Divider,
  Icon,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
} from "@kvib/react";
import { useKeyboardShortcut } from "hooks/keyboard-shortcuts/keyboard-shortcuts-hook";
import { useFeatureStyle } from "contexts/FeatureStyleContext";
import { LineString } from "ol/geom";
import { Feature } from "ol";
import { getFeatureId } from "utils/map/source";
import ToolbarPopup from "./ToolbarPopup";
import { useHistory } from "contexts/HistoryContext";
import { addArchivingEntryFromFeature } from "../OverlayPanels/MetadataPanel/utils";

const Container = styled.div`
  grid-area: toolbar;
  align-self: end;
  position: relative;
  margin: 16px 0;
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

const Toolbar = () => {
  const {
    activePointMode,
    togglePointMode,
    activeEditModes,
    toggleEditMode,
    canArchive,
  } = useToolbar();
  const { addHistoryEntry } = useHistory();
  const { getCurrentlyEditingType } = useEditAllGrenser();
  const editingType = getCurrentlyEditingType();
  const { activeOverlayPanel, openOverlayPanel, closeOverlayPanel } =
    useOverlayPanel();
  const flatedetaljerIsActive =
    activeOverlayPanel === "grunnkrets" || activeOverlayPanel === "stemmekrets";
  const mergeIsActive = activeOverlayPanel === "sammenslåing";

  const { selectedFeatures, setArchivedFeatures } = useFeatureStyle();

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

    features.forEach((feature) =>
      addArchivingEntryFromFeature(feature, addHistoryEntry)
    );
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
        <ToolbarPopup
          text={"Velg grensen du ønsker å arkivere"}
          buttonText={"Arkiver"}
          onClick={() => archiveFeatures(selectedFeatures)}
          isDisabled={canArchive}
        />
      )}
      <Container>
        <ToolbarButtons>
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
        </ToolbarButtons>
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

export default Toolbar;
