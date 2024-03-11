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
import { useEditAllGrenser } from "contexts/EditGrenserContext";
import { useOverlayPanel } from "contexts/OverlayPanelContext";
import { useToolbar } from "contexts/ToolbarContext";
import { useKeyboardShortcut } from "hooks/keyboard-shortcuts/keyboard-shortcuts-hook";
import { styled } from "styled-components";
import ToolbarButton from "./ToolbarButton";
import { KeyboardShortcuts } from "hooks/keyboard-shortcuts/keyboard-shortcuts";
import { ConditionalHide, ConditionalShow } from "components/ConditionalShowHide";

type MenuItems = (MenuItemProps & {
  $isActive: boolean;
  isDisabled: boolean;
  label: string;
})[];

const ToolbarMenus = () => {
  const { activeTool, toggleTool } = useToolbar();
  const { getCurrentlyEditingType } = useEditAllGrenser();
  const editingType = getCurrentlyEditingType();
  const {
    activeOverlayPanel,
    openOverlayPanel,
    closeOverlayPanel,
    activeOverlayModal,
    openOverlayModal,
    closeOverlayModal,
  } = useOverlayPanel();

  const mergeIsActive = activeOverlayPanel === "sammenslåing";

  const flatedetaljerIsActive = activeOverlayModal === "grunnkrets" || activeOverlayModal === "stemmekrets";

  const toggleFlatedetaljer = () => {
    if (flatedetaljerIsActive) {
      closeOverlayModal();
    } else if (editingType === "grunnkrets" || editingType === "stemmekrets") {
      openOverlayModal(editingType);
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

  const isEditMode = !!editingType;
  useKeyboardShortcut("add", () => toggleTool("add"), isEditMode);
  useKeyboardShortcut("remove", () => toggleTool("remove"), isEditMode);
  useKeyboardShortcut("edit_point", toggleMovePoint, isEditMode);
  useKeyboardShortcut("merge", toggleMergePanel, editingType === "stemmekrets");
  useKeyboardShortcut("archive", () => toggleTool("archive"), isEditMode);
  useKeyboardShortcut("flate", toggleFlatedetaljer);

  // For å kunne vise at en meny er aktiv må vi kunne sjekke hvorvidt noen av menuitems er aktive
  // Korteste vei til mål da blir å kunne iterere gjennom menu items
  const grenseMenuItems: MenuItems = [
    {
      label: "Tegn ny grense",
      icon: <Icon icon="edit" />,
      $isActive: activeTool === "draw",
      isDisabled: !isEditMode,
      onClick: () => toggleTool("draw"),
      "aria-label": "Tegn en ny grense fra et punkt",
    },
    {
      label: "Del grense",
      icon: <Icon icon="location_off" />,
      $isActive: activeTool === "split",
      isDisabled: !isEditMode,
      onClick: () => toggleTool("split"),
      "aria-label": "Del en grense i to fra et punkt",
    },
    {
      label: "Løsriv grense",
      icon: <Icon icon="edit_location_alt" />,
      $isActive: activeTool === "detach",
      isDisabled: !isEditMode,
      onClick: () => toggleTool("detach"),
      "aria-label": "Løsriv grense fra et knutepunkt",
    },

    {
      label: "Arkiver grense",
      icon: <Icon icon="archive" />,
      command: KeyboardShortcuts["archive"].displayString,
      $isActive: activeTool === "archive",
      isDisabled: !isEditMode,
      onClick: () => toggleTool("archive"),
      "aria-label": "Arkiver grense",
    },
  ];
  const punktMenuItems: MenuItems = [
    {
      label: "Flytt punkt med koordinater",
      icon: <Icon icon="ads_click" />,
      command: KeyboardShortcuts["edit_point"].displayString,
      $isActive: activeTool === "koordinater",
      isDisabled: !isEditMode,
      onClick: toggleMovePoint,
      "aria-label": "Flytt punkt med koordinater",
    },
    {
      label: "Legg til punkt",
      icon: <Icon icon="add_location_alt" />,
      command: KeyboardShortcuts["add"].displayString,
      $isActive: activeTool === "add",
      isDisabled: !isEditMode,
      onClick: () => toggleTool("add"),
      "aria-label": "Legg til punkter",
    },
    {
      label: "Fjern punkt",
      icon: <Icon icon="wrong_location" />,
      command: KeyboardShortcuts["remove"].displayString,
      $isActive: activeTool === "remove",
      isDisabled: !isEditMode,
      onClick: () => toggleTool("remove"),
      "aria-label": "Fjern punkter",
    },
  ];
  const flateMenuItems: MenuItems = [
    {
      label: "Se/endre flatedetaljer",
      icon: <Icon icon="edit_location_alt" />,
      command: KeyboardShortcuts["flate"].displayString,
      isDisabled: !isEditMode,
      $isActive: flatedetaljerIsActive,
      onClick: toggleFlatedetaljer,
      "aria-label": "Se eller endre flatedetaljer for kretsen som redigeres",
    },
    {
      label: "Slå sammen flater",
      icon: <Icon icon="merge" />,
      command: KeyboardShortcuts["merge"].displayString,
      $isActive: mergeIsActive,
      isDisabled: editingType !== "stemmekrets",
      onClick: toggleMergePanel,
      "aria-label": "Slå sammen stemmekretser",
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
