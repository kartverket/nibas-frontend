import { Divider, Hide, Icon, MenuDivider, MenuList, MenuOptionGroup } from "@kvib/react";
import { ConditionalHide, ConditionalShow } from "components/ConditionalShowHide";
import { useInndelinger } from "contexts/InndelingerContext/InndelingerContext";
import { useOverlayPanel } from "contexts/OverlayPanelContext";
import { useToolbar } from "contexts/ToolbarContext";
import { KeyboardShortcuts } from "hooks/keyboard-shortcuts/keyboard-shortcuts";
import { useKeyboardShortcut } from "hooks/keyboard-shortcuts/keyboard-shortcuts-hook";
import { ToolbarMenu } from "pages/Kart/Toolbar/ToolbarMenu";
import { anyFeatureIsEditable } from "utils/features";
import CustomTooltip from "./CustomTooltip";
import { MenuItems, ToolbarMenuItem } from "./Toolbar";

const ToolbarMenus = () => {
  const { activeTool, toggleTool, disableModeTool, activeModeTools } = useToolbar();
  const { activeOverlayPanel, closeOverlayPanel, toggleOverlayPanel, toggleOverlayModal, activeOverlayModal } =
    useOverlayPanel();

  const { currentlyEditingInndelinger, getAllInndelinger } = useInndelinger();

  const isEditing = currentlyEditingInndelinger.length > 0;

  const flatedetaljerIsAvailable = currentlyEditingInndelinger.some((inndeling) => {
    return inndeling.inndelingtype === "stemmekrets" || inndeling.inndelingtype === "grunnkrets";
  });

  const mergeIsAvailable = currentlyEditingInndelinger.some((inndeling) => {
    return inndeling.inndelingtype === "stemmekrets";
  });

  // TODO Sjekk om vi kan fjerne ubrukte inndelinger
  const flatedataIsAvailable =
    getAllInndelinger().filter((inndeling) => inndeling.isViewing || inndeling.isEditing).length > 0;

  const toggleMovePoint = () => {
    toggleTool("koordinater");

    if (activeOverlayPanel === "koordinater") {
      closeOverlayPanel();
    }
  };

  useKeyboardShortcut("add", () => toggleTool("add"), isEditing);
  useKeyboardShortcut("remove", () => toggleTool("remove"), isEditing);
  useKeyboardShortcut("movepoint", toggleMovePoint, isEditing);
  useKeyboardShortcut("merge", () => toggleOverlayPanel("sammenslåing"), mergeIsAvailable);
  useKeyboardShortcut("archive", () => toggleTool("archive"), isEditing);
  useKeyboardShortcut("draw", () => toggleTool("draw"), isEditing);
  useKeyboardShortcut("grensesplit", () => toggleTool("split"), isEditing);
  useKeyboardShortcut("flatesplit", () => toggleOverlayPanel("splitting"), isEditing);
  useKeyboardShortcut("flatedata", () => toggleOverlayModal("flatedata"));

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
      icon: <Icon icon="cut" />,
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
    {
      label: "Slett grense",
      icon: <Icon icon="delete_forever" />,
      command: KeyboardShortcuts["delete"].displayString,
      $isActive: activeTool === "delete",
      isDisabled: !isEditing,
      onClick: () => toggleTool("delete"),
      "aria-label": "Slett grense",
    },
  ];
  const punktMenuItems: MenuItems = [
    {
      label: "Flytt punkt (frihånd)",
      icon: <Icon icon="control_camera" />,
      command: KeyboardShortcuts["edit"].displayString,
      isDisabled: !isEditing || !anyFeatureIsEditable(),
      onClick: () => disableModeTool("move"),
      $isActive: !activeModeTools.includes("move"),
      "aria-label": "Flytt punkt med frihånd",
    },
    {
      label: "Flytt punkt (koordinater)",
      icon: <Icon icon="my_location" />,
      command: KeyboardShortcuts["movepoint"].displayString,
      $isActive: activeTool === "koordinater",
      isDisabled: !isEditing,
      onClick: toggleMovePoint,
      "aria-label": "Flytt punkt med koordinater",
    },
    {
      label: "Legg til punkt",
      icon: <Icon icon="add_circle" />,
      command: KeyboardShortcuts["add"].displayString,
      $isActive: activeTool === "add",
      isDisabled: !isEditing,
      onClick: () => toggleTool("add"),
      "aria-label": "Legg til punkter",
    },
    {
      label: "Fjern punkt",
      icon: <Icon icon="do_not_disturb_on" />,
      command: KeyboardShortcuts["remove"].displayString,
      $isActive: activeTool === "remove",
      isDisabled: !isEditing,
      onClick: () => toggleTool("remove"),
      "aria-label": "Fjern punkter",
    },
  ];
  const flateMenuItems: MenuItems = [
    {
      label: "Flatedetaljer",
      icon: <Icon icon="menu_book" />,
      command: KeyboardShortcuts["flatedata"].displayString,
      $isActive: activeOverlayModal === "flatedata",
      isDisabled: !flatedataIsAvailable,
      onClick: () => toggleOverlayModal("flatedata"),
      "aria-label": "Se eller endre flatedetaljer",
    },
    {
      label: "Slå sammen flater",
      icon: <Icon icon="cell_merge" />,
      command: KeyboardShortcuts["merge"].displayString,
      $isActive: activeOverlayPanel === "sammenslåing",
      isDisabled: !mergeIsAvailable,
      onClick: () => toggleOverlayPanel("sammenslåing"),
      "aria-label": "Slå sammen stemmekretser",
    },
    {
      label: "Splitt en flate",
      icon: <Icon icon="splitscreen" />,
      $isActive: activeOverlayPanel === "splitting",
      isDisabled: !flatedetaljerIsAvailable,
      onClick: () => toggleOverlayPanel("splitting"),
      "aria-label": "Splitt en flate",
      command: KeyboardShortcuts["flatesplit"].displayString,
    },
  ];
  return (
    <>
      <Divider orientation="vertical" />
      <Hide below="lg">
        <ConditionalHide above="lg" condition={!!activeOverlayPanel}>
          <ToolbarMenu
            label="Punkt"
            icon="adjust"
            isDisabled={false}
            isActive={punktMenuItems.some((pmi) => pmi.$isActive)}
            tooltip="Punkt"
          >
            <MenuList>
              {punktMenuItems.map((pmi) =>
                pmi.isDisabled ? (
                  <CustomTooltip
                    text="Åpne en inndeling for å aktivere"
                    aria-label="Verktøyet er ikke tilgjengelig. Du må først velge å redigere en inndeling."
                    key={pmi.label}
                  >
                    <ToolbarMenuItem {...pmi}>{pmi.label}</ToolbarMenuItem>
                  </CustomTooltip>
                ) : (
                  <ToolbarMenuItem {...pmi} key={pmi.label}>
                    {pmi.label}
                  </ToolbarMenuItem>
                ),
              )}
            </MenuList>
          </ToolbarMenu>
          <ToolbarMenu
            label="Grense"
            icon="timeline"
            isDisabled={false}
            isActive={grenseMenuItems.some((gmi) => gmi.$isActive)}
            tooltip="Grense"
          >
            <MenuList>
              {grenseMenuItems.map((gmi) =>
                gmi.isDisabled ? (
                  <CustomTooltip
                    text="Åpne en inndeling for å aktivere"
                    aria-label="Verktøyet er ikke tilgjengelig. Du må først velge å redigere en inndeling."
                    key={gmi.label}
                  >
                    <ToolbarMenuItem {...gmi}>{gmi.label}</ToolbarMenuItem>
                  </CustomTooltip>
                ) : (
                  <ToolbarMenuItem {...gmi} key={gmi.label}>
                    {gmi.label}
                  </ToolbarMenuItem>
                ),
              )}
            </MenuList>
          </ToolbarMenu>
          <ToolbarMenu
            label="Flate"
            icon="border_all"
            isDisabled={false}
            isActive={flateMenuItems.some((fmi) => fmi.$isActive)}
            tooltip="Flate"
          >
            <MenuList>
              {flateMenuItems.map((fmi) =>
                fmi.isDisabled ? (
                  <CustomTooltip
                    text="Åpne en inndeling for å aktivere"
                    aria-label="Verktøyet er ikke tilgjengelig. Du må først velge å redigere en inndeling."
                    key={fmi.label}
                  >
                    <ToolbarMenuItem {...fmi}>{fmi.label}</ToolbarMenuItem>
                  </CustomTooltip>
                ) : (
                  <ToolbarMenuItem {...fmi} key={fmi.label}>
                    {fmi.label}
                  </ToolbarMenuItem>
                ),
              )}
            </MenuList>
          </ToolbarMenu>
        </ConditionalHide>
      </Hide>
      <ConditionalShow below="lg" condition={!activeOverlayPanel}>
        <ToolbarMenu
          label="Verktøy"
          icon="handyman"
          isDisabled={false}
          isActive={
            grenseMenuItems.some((gmi) => gmi.$isActive) ||
            punktMenuItems.some((pmi) => pmi.$isActive) ||
            flateMenuItems.some((fmi) => fmi.$isActive)
          }
          tooltip={"Verktøy"}
        >
          <MenuList>
            <MenuOptionGroup title="Punkt">
              {punktMenuItems.map((pmi) =>
                pmi.isDisabled ? (
                  <CustomTooltip
                    text="Åpne en inndeling for å aktivere"
                    aria-label="Verktøyet er ikke tilgjengelig. Du må først velge å redigere en inndeling."
                    key={pmi.label}
                  >
                    <ToolbarMenuItem {...pmi}>{pmi.label}</ToolbarMenuItem>
                  </CustomTooltip>
                ) : (
                  <ToolbarMenuItem {...pmi} key={pmi.label}>
                    {pmi.label}
                  </ToolbarMenuItem>
                ),
              )}
            </MenuOptionGroup>
            <MenuDivider />
            <MenuOptionGroup title="Grense">
              {grenseMenuItems.map((gmi) =>
                gmi.isDisabled ? (
                  <CustomTooltip
                    text="Åpne en inndeling for å aktivere"
                    aria-label="Verktøyet er ikke tilgjengelig. Du må først velge å redigere en inndeling."
                    key={gmi.label}
                  >
                    <ToolbarMenuItem {...gmi}>{gmi.label}</ToolbarMenuItem>
                  </CustomTooltip>
                ) : (
                  <ToolbarMenuItem {...gmi} key={gmi.label}>
                    {gmi.label}
                  </ToolbarMenuItem>
                ),
              )}
            </MenuOptionGroup>
            <MenuDivider />
            <MenuOptionGroup title="Flate">
              {flateMenuItems.map((fmi) =>
                fmi.isDisabled ? (
                  <CustomTooltip
                    text="Åpne en inndeling for å aktivere"
                    aria-label="Verktøyet er ikke tilgjengelig. Du må først velge å redigere en inndeling."
                    key={fmi.label}
                  >
                    <ToolbarMenuItem {...fmi}>{fmi.label}</ToolbarMenuItem>
                  </CustomTooltip>
                ) : (
                  <ToolbarMenuItem {...fmi} key={fmi.label}>
                    {fmi.label}
                  </ToolbarMenuItem>
                ),
              )}
            </MenuOptionGroup>
          </MenuList>
        </ToolbarMenu>
      </ConditionalShow>
      <Divider orientation="vertical" />
    </>
  );
};

export default ToolbarMenus;
