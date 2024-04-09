import {
  Divider,
  Hide,
  Icon,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuItemProps,
  MenuList,
  MenuOptionGroup,
} from "@kvib/react";
import { useOverlayPanel } from "contexts/OverlayPanelContext";
import { useToolbar } from "contexts/ToolbarContext";
import { useKeyboardShortcut } from "hooks/keyboard-shortcuts/keyboard-shortcuts-hook";
import { styled } from "styled-components";
import ToolbarButton from "./ToolbarButton";
import { KeyboardShortcuts } from "hooks/keyboard-shortcuts/keyboard-shortcuts";
import { ConditionalHide, ConditionalShow } from "components/ConditionalShowHide";
import { useInndelinger } from "contexts/InndelingerContext/InndelingerContext";

type MenuItems = (MenuItemProps & {
  $isActive: boolean;
  isDisabled: boolean;
  label: string;
})[];

const ToolbarMenus = () => {
  const { activeTool, toggleTool } = useToolbar();
  const {
    activeOverlayPanel,
    openOverlayPanel,
    closeOverlayPanel,
    activeOverlayModal,
    openOverlayModal,
    closeOverlayModal,
  } = useOverlayPanel();

  const { currentlyEditedInndeling } = useInndelinger();

  const isEditing = currentlyEditedInndeling != null;

  const mergeIsActive = activeOverlayPanel === "sammenslåing";
  const splitIsActive = activeOverlayPanel === "splitting";

  const flatedetaljerIsActive = activeOverlayModal === "grunnkrets" || activeOverlayModal === "stemmekrets";

  const toggleFlatedetaljer = () => {
    const currentlyEditingKretsType = currentlyEditedInndeling?.inndelingtype;
    if (flatedetaljerIsActive) {
      closeOverlayModal();
    } else if (
      (currentlyEditingKretsType && currentlyEditingKretsType === "grunnkrets") ||
      currentlyEditingKretsType === "stemmekrets"
    ) {
      openOverlayModal(currentlyEditingKretsType);
    }
  };

  const toggleMovePoint = () => {
    toggleTool("koordinater");

    if (activeOverlayPanel === "koordinater") {
      closeOverlayPanel();
    }
  };

  const toggleMergePanel = () => {
    if (mergeIsActive) {
      closeOverlayPanel();
    } else {
      openOverlayPanel("sammenslåing");
    }
  };

  const toggleSplitPanel = () => (splitIsActive ? closeOverlayPanel() : openOverlayPanel("splitting"));

  useKeyboardShortcut("add", () => toggleTool("add"), isEditing);
  useKeyboardShortcut("remove", () => toggleTool("remove"), isEditing);
  useKeyboardShortcut("edit_point", toggleMovePoint, isEditing);
  useKeyboardShortcut("merge", toggleMergePanel, currentlyEditedInndeling?.inndelingtype === "stemmekrets");
  useKeyboardShortcut("archive", () => toggleTool("archive"), isEditing);
  useKeyboardShortcut("draw", () => toggleTool("draw"), isEditing);
  useKeyboardShortcut("flate", toggleFlatedetaljer);

  // For å kunne vise at en meny er aktiv må vi kunne sjekke hvorvidt noen av menuitems er aktive
  // Korteste vei til mål da blir å kunne iterere gjennom menu items
  const grenseMenuItems: MenuItems = [
    {
      label: "Tegn ny grense",
      icon: <Icon icon="draw" />,
      command: KeyboardShortcuts["draw"].displayString,
      $isActive: activeTool === "draw",
      isDisabled: !isEditing,
      onClick: () => toggleTool("draw"),
      "aria-label": "Tegn en ny grense fra et punkt",
    },
    {
      label: "Del grense",
      icon: <Icon icon="alt_route" />,
      $isActive: activeTool === "split",
      isDisabled: !isEditing,
      onClick: () => toggleTool("split"),
      "aria-label": "Del en grense i to fra et punkt",
    },
    {
      label: "Løsriv grense",
      icon: <Icon icon="low_priority" />,
      $isActive: activeTool === "detach",
      isDisabled: !isEditing,
      onClick: () => toggleTool("detach"),
      "aria-label": "Løsriv grense fra et knutepunkt",
    },

    {
      label: "Arkiver grense",
      icon: <Icon icon="archive" />,
      command: KeyboardShortcuts["archive"].displayString,
      $isActive: activeTool === "archive",
      isDisabled: !isEditing,
      onClick: () => toggleTool("archive"),
      "aria-label": "Arkiver grense",
    },
  ];
  const punktMenuItems: MenuItems = [
    {
      label: "Flytt punkt med koordinater",
      icon: <Icon icon="location_on" />,
      command: KeyboardShortcuts["edit_point"].displayString,
      $isActive: activeTool === "koordinater",
      isDisabled: !isEditing,
      onClick: toggleMovePoint,
      "aria-label": "Flytt punkt med koordinater",
    },
    {
      label: "Legg til punkt",
      icon: <Icon icon="add_location_alt" />,
      command: KeyboardShortcuts["add"].displayString,
      $isActive: activeTool === "add",
      isDisabled: !isEditing,
      onClick: () => toggleTool("add"),
      "aria-label": "Legg til punkter",
    },
    {
      label: "Fjern punkt",
      icon: <Icon icon="wrong_location" />,
      command: KeyboardShortcuts["remove"].displayString,
      $isActive: activeTool === "remove",
      isDisabled: !isEditing,
      onClick: () => toggleTool("remove"),
      "aria-label": "Fjern punkter",
    },
  ];
  const flateMenuItems: MenuItems = [
    {
      label: "Se/endre flatedetaljer",
      icon: <Icon icon="description" />,
      command: KeyboardShortcuts["flate"].displayString,
      isDisabled: !isEditing,
      $isActive: flatedetaljerIsActive,
      onClick: toggleFlatedetaljer,
      "aria-label": "Se eller endre flatedetaljer for kretsen som redigeres",
    },
    {
      label: "Slå sammen flater",
      icon: <Icon icon="cell_merge" />,
      command: KeyboardShortcuts["merge"].displayString,
      $isActive: mergeIsActive,
      isDisabled: currentlyEditedInndeling?.inndelingtype !== "stemmekrets",
      onClick: toggleMergePanel,
      "aria-label": "Slå sammen stemmekretser",
    },
    {
      label: "Splitt en flate",
      icon: <Icon icon="splitscreen" />,
      $isActive: splitIsActive,
      isDisabled: !(
        currentlyEditedInndeling?.inndelingtype === "stemmekrets" ||
        currentlyEditedInndeling?.inndelingtype === "grunnkrets"
      ),
      onClick: toggleSplitPanel,
      "aria-label": "Splitt en flate",
    },
  ];
  return (
    <>
      <Divider orientation="vertical" />
      <Hide below="xl">
        <ConditionalHide above="xl" condition={!!activeOverlayPanel}>
          <Menu autoSelect={false}>
            <MenuButton
              as={ToolbarButton}
              aria-label="Grenseverktøy"
              icon="timeline"
              isDisabled={grenseMenuItems.every((gmi) => gmi.isDisabled)}
              isActive={grenseMenuItems.some((gmi) => gmi.$isActive)}
              tooltip={{ text: "Vis grenseverktøy" }}
            >
              Grense
            </MenuButton>
            <MenuList>
              {grenseMenuItems.map((gmi) => (
                <ToolbarMenuItem key={gmi.label} {...gmi}>
                  {gmi.label}
                </ToolbarMenuItem>
              ))}
            </MenuList>
          </Menu>
          <Menu autoSelect={false}>
            <MenuButton
              as={ToolbarButton}
              aria-label="Punktverktøy"
              icon="radio_button_checked"
              isDisabled={punktMenuItems.every((pmi) => pmi.isDisabled)}
              isActive={punktMenuItems.some((pmi) => pmi.$isActive)}
              tooltip={{ text: "Vis punktverktøy" }}
            >
              Punkt
            </MenuButton>
            <MenuList>
              {punktMenuItems.map((pmi) => (
                <ToolbarMenuItem key={pmi.label} {...pmi}>
                  {pmi.label}
                </ToolbarMenuItem>
              ))}
            </MenuList>
          </Menu>
          <Menu autoSelect={false}>
            <MenuButton
              as={ToolbarButton}
              aria-label="Flateverktøy"
              icon="crop_landscape"
              isDisabled={flateMenuItems.every((fmi) => fmi.isDisabled)}
              isActive={flateMenuItems.some((fmi) => fmi.$isActive)}
              tooltip={{ text: "Vis flateverktøy" }}
            >
              Flate
            </MenuButton>
            <MenuList>
              {flateMenuItems.map((fmi) => (
                <ToolbarMenuItem key={fmi.label} {...fmi}>
                  {fmi.label}
                </ToolbarMenuItem>
              ))}
            </MenuList>
          </Menu>
        </ConditionalHide>
      </Hide>
      <ConditionalShow below="xl" condition={!activeOverlayPanel}>
        <Menu autoSelect={false}>
          <MenuButton
            as={ToolbarButton}
            aria-label="Verktøy"
            icon="timeline"
            isDisabled={
              grenseMenuItems.every((gmi) => gmi.isDisabled) &&
              punktMenuItems.every((pmi) => pmi.isDisabled) &&
              flateMenuItems.every((fmi) => fmi.isDisabled)
            }
            isActive={
              grenseMenuItems.some((gmi) => gmi.$isActive) &&
              punktMenuItems.some((pmi) => pmi.$isActive) &&
              flateMenuItems.some((fmi) => fmi.$isActive)
            }
            tooltip={{ text: "Vis verktøy" }}
          >
            Verktøy
          </MenuButton>
          <MenuList>
            <MenuOptionGroup title="Grense">
              {grenseMenuItems.map((gmi) => (
                <ToolbarMenuItem key={gmi.label} {...gmi}>
                  {gmi.label}
                </ToolbarMenuItem>
              ))}
            </MenuOptionGroup>
            <MenuDivider />
            <MenuOptionGroup title="Punkt">
              {punktMenuItems.map((pmi) => (
                <ToolbarMenuItem key={pmi.label} {...pmi}>
                  {pmi.label}
                </ToolbarMenuItem>
              ))}
            </MenuOptionGroup>
            <MenuDivider />
            <MenuOptionGroup title="Flate">
              {flateMenuItems.map((fmi) => (
                <ToolbarMenuItem key={fmi.label} {...fmi}>
                  {fmi.label}
                </ToolbarMenuItem>
              ))}
            </MenuOptionGroup>
          </MenuList>
        </Menu>
      </ConditionalShow>
      <Divider orientation="vertical" />
    </>
  );
};

const ToolbarMenuItem = styled(MenuItem)<{ $isActive: boolean }>`
  background: ${(props) => props.$isActive && "var(--kvib-colors-blue-50)"};
`;

export default ToolbarMenus;
