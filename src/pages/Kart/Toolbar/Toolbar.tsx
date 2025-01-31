import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Divider,
  Icon,
  MenuItem,
  MenuItemProps,
  MenuList,
  useDisclosure,
} from "@kvib/react";
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
import { ToolbarMenu } from "./ToolbarMenu";
import { KeyboardShortcuts } from "hooks/keyboard-shortcuts/keyboard-shortcuts";

export type MenuItems = (MenuItemProps & {
  $isActive: boolean;
  isDisabled: boolean;
  label: string;
})[];

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

  const { currentlyEditingInndelinger, getAllInndelinger } = useInndelinger();
  const isEditing = currentlyEditingInndelinger.length > 0;

  // TODO Sjekk om vi kan fjerne ubrukte inndelinger
  const flatedataIsAvailable =
    getAllInndelinger().filter((inndeling) => inndeling.isViewing || inndeling.isEditing).length > 0;

  const { isOpen: isSnapMenuOpen, onClose: closeSnapMenu, onToggle: toggleSnapMenu } = useDisclosure();

  const toggleGrenseinfo = () => {
    toggleTool("grenseinfo");

    if (activeOverlayPanel === "grenseinfo") {
      closeOverlayPanel();
    }
  };

  const zoom = (difference: number) => {
    const view = map.getView();
    view.animate({
      zoom: (view.getZoom() ?? 0) + difference,
      duration: 250,
    });
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
    if (!isEditing) {
      return false;
    }

    const drawInteraction = map
      .getInteractions()
      .getArray()
      .find((interaction) => interaction instanceof Draw);

    if (activeTool === "draw" && !drawInteraction) {
      return true;
    }
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
    if (activeTool == null || activeTool !== "draw") {
      return;
    }

    if (isPanningAllowed()) {
      setPanningEnabled(true);
    } else {
      setPanningEnabled(false);
    }
  });

  useKeyboardShortcut("layers", () => toggleOverlayPanel("kartlag"));
  useKeyboardShortcut("move", () => {
    if (activeModeTools.includes("move") && isEditing && anyFeatureIsEditable()) {
      if (!utkast) return;
      disableModeTool("move");
      isEditing;
    } else {
      enableModeTool("move");
      panningEnabled;
    }
  });
  useKeyboardShortcut("matrikkel", () => toggleModeTool("matrikkel"));
  useKeyboardShortcut("grenseinfo", toggleGrenseinfo);
  useKeyboardShortcut("grensecoordinates", () => toggleTool("grensecoordinates"));
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

  const informasjonMenuItems: MenuItems = [
    {
      label: "Informasjon om grense",
      icon: <Icon icon="info" />,
      command: KeyboardShortcuts["grenseinfo"].displayString,
      $isActive: activeTool === "grenseinfo",
      isDisabled: false,
      onClick: toggleGrenseinfo,
      "aria-label": "Informasjon om grense",
    },
    {
      label: "Vis koordinater på punkt",
      icon: <Icon icon="fmd_bad" />,
      command: KeyboardShortcuts["grensecoordinates"].displayString,
      $isActive: activeTool === "grensecoordinates",
      isDisabled: false,
      onClick: () => toggleTool("grensecoordinates"),
      "aria-label": "Vis koordinater på punkt",
    },
  ];

  return (
    <OuterContainer>
      <ToolInfoAlert $isOpen={activeTool === "delete"}>
        <AlertIcon />
        <div>
          <AlertDescription>
            {`
          Sletteverktøyet er kun tiltenkt grenser som er opprettet i utkastet.
          `}
          </AlertDescription>
        </div>
      </ToolInfoAlert>
      <ToolbarPopups />
      <Container>
        <ToolbarButtons>
          <ToolbarButton
            icon={"back_hand"}
            onClick={() => {
              if (activeModeTools.includes("move") && isEditing && anyFeatureIsEditable()) {
                if (!utkast) return;
                disableModeTool("move");
                isEditing;
              } else {
                enableModeTool("move");
                panningEnabled;
              }
            }}
            isActive={activeModeTools.includes("move")}
            aria-label={"Panorer i kartet"}
            tooltip={{
              text: "Panorer i kartet",
              shortcut: "move",
              holdButton: "ALT-tasten",
              additionalInfo: "Hold inne Shift + marker i kartet for å zoome",
            }}
          />
          <Divider orientation="vertical" />
          <ToolbarButton
            icon="remove"
            onClick={() => zoom(-1)}
            variant="ghost"
            aria-label="Zoom ut fra kartet"
            tooltip={{ text: "Zoom ut" }}
          />
          <ToolbarButton
            icon="add"
            onClick={() => zoom(1)}
            variant="ghost"
            aria-label="Zoom inn på kartet"
            tooltip={{ text: "Zoom inn" }}
          />
          <ConditionalHide below="xl" condition={!!activeOverlayPanel}>
            <ToolbarMenus />
          </ConditionalHide>
          <ToolbarButton
            icon="search"
            isActive={activeOverlayModal === "navigasjon"}
            onClick={() => toggleOverlayModal("navigasjon")}
            aria-label="Gå til inndeling eller punkt i kartet"
            tooltip={{ text: "Finn i kartet", shortcut: "goto" }}
          ></ToolbarButton>
          {!utkast && (
            <ToolbarButton
              icon="window"
              onClick={() => toggleOverlayModal("flatedata")}
              isActive={activeOverlayModal === "flatedata"}
              isDisabled={!flatedataIsAvailable}
              aria-label="Se eller endre flatedetaljer"
              tooltip={{
                text: "Se eller endre flatedetaljer",
                additionalInfo: !flatedataIsAvailable ? "Velg en inndeling for å aktivere verktøyet" : undefined,
                shortcut: "flatedata",
              }}
            ></ToolbarButton>
          )}
          <ToolbarMenu
            icon="info"
            isActive={informasjonMenuItems.some((imi) => imi.$isActive)}
            aria-label="Vis informasjonsverktøy"
            tooltip="Informasjon"
            isDisabled={false}
            label={"Informasjon"}
          >
            <MenuList>
              {informasjonMenuItems.map((imi) => (
                <ToolbarMenuItem key={imi.label} {...imi}>
                  {imi.label}
                </ToolbarMenuItem>
              ))}
            </MenuList>
          </ToolbarMenu>
          <ToolbarButton
            icon="stacks"
            aria-label="Åpne kartlagsmenyen"
            isActive={activeOverlayPanel === "kartlag"}
            onClick={() => toggleOverlayPanel("kartlag")}
            tooltip={{ text: "Kartlag", shortcut: "layers" }}
          ></ToolbarButton>
          <ConditionalHide below="xl" condition={!!activeOverlayPanel}>
            <>
              <ToolbarButton
                icon="holiday_village"
                aria-label="Teiggrenser"
                isActive={activeModeTools.includes("matrikkel")}
                onClick={toggleMatrikkel}
                tooltip={{ text: "Teiggrenser", shortcut: "matrikkel" }}
              ></ToolbarButton>
              {utkast && <SnapMenu isOpen={isSnapMenuOpen} onClose={closeSnapMenu} onToggle={toggleSnapMenu} />}
            </>
          </ConditionalHide>
        </ToolbarButtons>
      </Container>
    </OuterContainer>
  );
};

const ToolInfoAlert = styled(Alert)<{ $isOpen?: boolean }>`
  ${(props) => props.$isOpen === false && "display: none"};
  position: absolute;
  top: 10px;
  width: var(--kvib-breakpoints-md);
  border-radius: var(--kvib-space-2);
  box-shadow: var(--kvib-shadows-lg);
`;

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
  gap: 18px;

  width: fit-content;
  padding: 12px;
  background: white;
  border-radius: var(--kvib-radii-lg);
  box-shadow: var(--kvib-shadows-sm);
`;

export const ToolbarMenuItem = styled(MenuItem)<{ $isActive: boolean }>`
  background: ${(props) => props.$isActive && "var(--kvib-colors-blue-50)"};
`;

export default Toolbar;
