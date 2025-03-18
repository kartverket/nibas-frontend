import { Divider, Flex, Icon, MenuItem, MenuItemProps, MenuList, useDisclosure } from "@kvib/react";
import { useFeatureStyle } from "contexts/FeatureStyleContext/FeatureStyleContext";
import { useInndelinger } from "contexts/InndelingerContext/InndelingerContext";
import { useOverlayPanel } from "contexts/OverlayPanelContext";
import { useToolbar } from "contexts/ToolbarContext";
import { useUtkast } from "contexts/UtkastContext/UtkastContext";
import { KeyboardShortcuts } from "hooks/keyboard-shortcuts/keyboard-shortcuts";
import { useHoldButtonToggle, useKeyboardShortcut } from "hooks/keyboard-shortcuts/keyboard-shortcuts-hook";
import { Draw } from "ol/interaction";
import { useEffect, useState } from "react";
import { styled } from "styled-components";
import { anyFeatureIsEditable } from "utils/features";
import { getLayerById } from "utils/map/layers";
import { map } from "../constants";
import SnapMenu from "./SnapMenu";
import ToolbarButton from "./ToolbarButton";
import { ToolbarMenu } from "./ToolbarMenu";
import ToolbarMenus from "./ToolbarMenus";
import ToolbarPopups from "./ToolbarPopups";

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
    toggleOverlayPanel("grenseinfo", false);
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

  useEffect(() => {
    if (activeTool !== "grenseinfo" && activeOverlayPanel === "grenseinfo") {
      closeOverlayPanel(false);
    }
  }, [activeTool, activeOverlayPanel, closeOverlayPanel]);

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
  useKeyboardShortcut("edit", () => disableModeTool("move"), isEditing);
  useKeyboardShortcut("move", () => {
    if (activeModeTools.includes("move") && isEditing && anyFeatureIsEditable()) {
      if (!utkast) {
        return;
      }
    } else {
      enableModeTool("move");
      panningEnabled;
    }
  });
  useKeyboardShortcut("preview", () => toggleOverlayModal("inndelinger-view"));
  useKeyboardShortcut("matrikkel", () => toggleModeTool("matrikkel"));
  useKeyboardShortcut("grenseinfo", toggleGrenseinfo);
  useKeyboardShortcut("grensecoordinates", () => toggleTool("grensecoordinates"));
  useKeyboardShortcut("measure", () => toggleTool("measure"));
  useKeyboardShortcut("goto", () => toggleOverlayModal("navigasjon"));
  useKeyboardShortcut("tegnforklaring", () => toggleOverlayPanel("tegnforklaring"));
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
      label: "Grenseinformasjon",
      icon: <Icon icon="query_stats" />,
      command: KeyboardShortcuts["grenseinfo"].displayString,
      $isActive: activeTool === "grenseinfo",
      isDisabled: false,
      onClick: toggleGrenseinfo,
      "aria-label": "Informasjon om grense",
    },
    {
      label: "Koordinater på punkter",
      icon: <Icon icon="fmd_bad" />,
      command: KeyboardShortcuts["grensecoordinates"].displayString,
      $isActive: activeTool === "grensecoordinates",
      isDisabled: false,
      onClick: () => toggleTool("grensecoordinates"),
      "aria-label": "Vis koordinater på punkt",
    },
    {
      label: "Måleverktøy",
      icon: <Icon icon="straighten" />,
      command: KeyboardShortcuts["measure"].displayString,
      $isActive: activeTool === "measure",
      isDisabled: false,
      onClick: () => toggleTool("measure"),
      "aria-label": "Mål avstand",
    },
    {
      label: "Tegnforklaring",
      icon: <Icon icon="palette" />,
      command: KeyboardShortcuts["tegnforklaring"].displayString,
      $isActive: activeOverlayPanel === "tegnforklaring",
      isDisabled: false,
      onClick: () => toggleOverlayPanel("tegnforklaring"),
      "aria-label": "Åpne tegnforklaring",
    },
  ];
  const kartlagMenuItems: MenuItems = [
    {
      label: "Bakgrunnskart",
      icon: <Icon icon="map" />,
      command: KeyboardShortcuts["layers"].displayString,
      $isActive: activeOverlayPanel === "kartlag",
      isDisabled: false,
      onClick: () => toggleOverlayPanel("kartlag"),
      "aria-label": "Åpne bakgrunnskartpanelet",
    },
    {
      label: "Eiendomsgrenser",
      icon: <Icon icon="holiday_village" />,
      command: KeyboardShortcuts["matrikkel"].displayString,
      $isActive: activeModeTools.includes("matrikkel"),
      isDisabled: false,
      onClick: toggleMatrikkel,
      "aria-label": "Vis eiendomsgrenser",
    },
    {
      label: "Forhåndsvis inndelinger",
      icon: <Icon icon="preview" />,
      command: KeyboardShortcuts["preview"].displayString,
      $isActive: activeOverlayModal === "inndelinger-view",
      isDisabled: false,
      onClick: () => toggleOverlayModal("inndelinger-view"),
      "aria-label": "Legg til egne grenser som forhåndsvisning i bakgrunnen av kartet",
    },
  ];

  return (
    <OuterContainer>
      <ToolbarPopups />
      <Container>
        <ToolbarButtons>
          <ToolbarButton
            icon={"back_hand"}
            onClick={() => {
              if (activeModeTools.includes("move") && isEditing && anyFeatureIsEditable()) {
                if (!utkast) {
                  return;
                }
              } else {
                enableModeTool("move");
              }
            }}
            isActive={activeModeTools.includes("move")}
            aria-label={"Panorer i kartet"}
            tooltip={{
              text: "Panorer i kartet",
              shortcut: "move",
              holdButton: "Alt",
              additionalInfo: "Shift + marker i kartet for å zoome",
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
          {!utkast && (
            <Flex height="100%" gap="18px">
              <Divider orientation="vertical" />
              <ToolbarButton
                icon="menu_book"
                onClick={() => toggleOverlayModal("flatedata")}
                isActive={activeOverlayModal === "flatedata"}
                isDisabled={!flatedataIsAvailable}
                aria-label="Se flatedetaljer"
                tooltip={{
                  text: "Se flatedetaljer",
                  additionalInfo: !flatedataIsAvailable
                    ? "Forhåndsvis en inndeling for å aktivere verktøyet"
                    : undefined,
                  shortcut: "flatedata",
                }}
              ></ToolbarButton>
              <Divider orientation="vertical" />
            </Flex>
          )}
          {utkast && <ToolbarMenus />}

          <ToolbarButton
            icon="search"
            isActive={activeOverlayModal === "navigasjon"}
            onClick={() => toggleOverlayModal("navigasjon")}
            aria-label="Gå til inndeling eller punkt i kartet"
            tooltip={{ text: "Finn i kartet", shortcut: "goto" }}
          ></ToolbarButton>
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
          <ToolbarMenu
            icon="stacks"
            isActive={kartlagMenuItems.some((kmi) => kmi.$isActive)}
            aria-label="Kartlag"
            tooltip="Kartlag"
            isDisabled={false}
            label={"Kartlag"}
          >
            <MenuList>
              {kartlagMenuItems.map((kmi) => (
                <ToolbarMenuItem key={kmi.label} {...kmi}>
                  {kmi.label}
                </ToolbarMenuItem>
              ))}
            </MenuList>
          </ToolbarMenu>
          <>{utkast && <SnapMenu isOpen={isSnapMenuOpen} onClose={closeSnapMenu} onToggle={toggleSnapMenu} />}</>
        </ToolbarButtons>
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
