import { Divider, Hide, Icon, MenuDivider, MenuItem, MenuItemProps, MenuList, MenuOptionGroup } from "@kvib/react";
import { useOverlayPanel } from "contexts/OverlayPanelContext";
import { useToolbar } from "contexts/ToolbarContext";
import { useKeyboardShortcut } from "hooks/keyboard-shortcuts/keyboard-shortcuts-hook";
import { styled } from "styled-components";
import { KeyboardShortcuts } from "hooks/keyboard-shortcuts/keyboard-shortcuts";
import { ConditionalHide, ConditionalShow } from "components/ConditionalShowHide";
import { useInndelinger } from "contexts/InndelingerContext/InndelingerContext";
import { ToolbarMenu } from "pages/Kart/Toolbar/ToolbarMenu";

type MenuItems = (MenuItemProps & {
  $isActive: boolean;
  isDisabled: boolean;
  label: string;
})[];

const ToolbarMenus = () => {
  const { activeTool, toggleTool } = useToolbar();
  const { activeOverlayPanel, closeOverlayPanel, toggleOverlayPanel } = useOverlayPanel();

  const { currentlyEditedInndeling } = useInndelinger();

  const isEditing = currentlyEditedInndeling != null;
  const currentlyEditingInndelingtype = currentlyEditedInndeling?.inndelingtype;

  const toggleMovePoint = () => {
    toggleTool("koordinater");

    if (activeOverlayPanel === "koordinater") {
      closeOverlayPanel();
    }
  };

  useKeyboardShortcut("add", () => toggleTool("add"), isEditing);
  useKeyboardShortcut("remove", () => toggleTool("remove"), isEditing);
  useKeyboardShortcut("movepoint", toggleMovePoint, isEditing);
  useKeyboardShortcut(
    "merge",
    () => toggleOverlayPanel("sammenslåing"),
    currentlyEditingInndelingtype === "stemmekrets",
  );
  useKeyboardShortcut("archive", () => toggleTool("archive"), isEditing);
  useKeyboardShortcut("draw", () => toggleTool("draw"), isEditing);
  useKeyboardShortcut("grensesplit", () => toggleTool("split"), isEditing);
  useKeyboardShortcut("flatesplit", () => toggleOverlayPanel("splitting"), isEditing);

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
      command: KeyboardShortcuts["grensesplit"].displayString,
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
      command: KeyboardShortcuts["movepoint"].displayString,
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
      label: "Slå sammen flater",
      icon: <Icon icon="cell_merge" />,
      command: KeyboardShortcuts["merge"].displayString,
      $isActive: activeOverlayPanel === "sammenslåing",
      isDisabled: currentlyEditingInndelingtype !== "stemmekrets",
      onClick: () => toggleOverlayPanel("sammenslåing"),
      "aria-label": "Slå sammen stemmekretser",
    },
    {
      label: "Splitt en flate",
      icon: <Icon icon="splitscreen" />,
      $isActive: activeOverlayPanel === "splitting",
      isDisabled: !(currentlyEditingInndelingtype === "stemmekrets" || currentlyEditingInndelingtype === "grunnkrets"),
      onClick: () => toggleOverlayPanel("splitting"),
      "aria-label": "Splitt en flate",
      command: KeyboardShortcuts["flatesplit"].displayString,
    },
  ];
  return (
    <>
      <Divider orientation="vertical" />
      <Hide below="xl">
        <ConditionalHide above="xl" condition={!!activeOverlayPanel}>
          <ToolbarMenu
            label="Grenseverktøy"
            icon="timeline"
            isDisabled={grenseMenuItems.every((gmi) => gmi.isDisabled)}
            isActive={grenseMenuItems.some((gmi) => gmi.$isActive)}
            tooltip="Vis grenseverktøy"
          >
            <MenuList>
              {grenseMenuItems.map((gmi) => (
                <ToolbarMenuItem key={gmi.label} {...gmi}>
                  {gmi.label}
                </ToolbarMenuItem>
              ))}
            </MenuList>
          </ToolbarMenu>
          <ToolbarMenu
            label="Punkt"
            icon="radio_button_checked"
            isDisabled={punktMenuItems.every((pmi) => pmi.isDisabled)}
            isActive={punktMenuItems.some((pmi) => pmi.$isActive)}
            tooltip="Vis punktverktøy"
          >
            <MenuList>
              {punktMenuItems.map((pmi) => (
                <ToolbarMenuItem key={pmi.label} {...pmi}>
                  {pmi.label}
                </ToolbarMenuItem>
              ))}
            </MenuList>
          </ToolbarMenu>
          <ToolbarMenu
            label="Flate"
            icon="crop_landscape"
            isDisabled={flateMenuItems.every((fmi) => fmi.isDisabled)}
            isActive={flateMenuItems.some((fmi) => fmi.$isActive)}
            tooltip="Vis flateverktøy"
          >
            <MenuList>
              {flateMenuItems.map((fmi) => (
                <ToolbarMenuItem key={fmi.label} {...fmi}>
                  {fmi.label}
                </ToolbarMenuItem>
              ))}
            </MenuList>
          </ToolbarMenu>
        </ConditionalHide>
      </Hide>
      <ConditionalShow below="xl" condition={!activeOverlayPanel}>
        <ToolbarMenu
          label="Verktøy"
          icon="timeline"
          isDisabled={
            grenseMenuItems.every((gmi) => gmi.isDisabled) &&
            punktMenuItems.every((pmi) => pmi.isDisabled) &&
            flateMenuItems.every((fmi) => fmi.isDisabled)
          }
          isActive={
            grenseMenuItems.some((gmi) => gmi.$isActive) ||
            punktMenuItems.some((pmi) => pmi.$isActive) ||
            flateMenuItems.some((fmi) => fmi.$isActive)
          }
          tooltip={"Vis verktøy"}
        >
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
        </ToolbarMenu>
      </ConditionalShow>
      <Divider orientation="vertical" />
    </>
  );
};

const ToolbarMenuItem = styled(MenuItem)<{ $isActive: boolean }>`
  background: ${(props) => props.$isActive && "var(--kvib-colors-blue-50)"};
`;

export default ToolbarMenus;
