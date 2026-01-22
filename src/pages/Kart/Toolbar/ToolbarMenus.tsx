import { Divider, Flex, Icon, MenuDivider, MenuList, MenuOptionGroup, useMediaQuery, useTheme } from "@kvib/react";
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

  const theme = useTheme();
  const { getCurrentlyEditingInndelingerOfType, currentlyEditingInndelinger, getAllInndelinger } = useInndelinger();

  const isEditing = currentlyEditingInndelinger.length > 0;

  const isEditingGrunnkrets = getCurrentlyEditingInndelingerOfType("GRUNNKRETS").length > 0;
  const isEditingStemmekrets = getCurrentlyEditingInndelingerOfType("STEMMEKRETS").length > 0;
  const isEditingBopliktomraader = getCurrentlyEditingInndelingerOfType("BOPLIKTOMRAADE").length > 0;
  const isEditingStemmekretsOrGrunnkrets = isEditingGrunnkrets || isEditingStemmekrets;

  const [isWide] = useMediaQuery("(min-width: " + theme.breakpoints["2xl"] + ")");
  const [isSmall] = useMediaQuery("(min-width: " + theme.breakpoints["lg"] + ")");

  // TODO Sjekk om vi kan fjerne ubrukte inndelinger
  const flatedataIsAvailable =
    getAllInndelinger().filter((inndeling) => inndeling.isViewing === true || inndeling.isEditing === true).length > 0;

  const toggleMovePoint = () => {
    toggleTool("koordinater");

    if (activeOverlayPanel === "koordinater") {
      closeOverlayPanel();
    }
  };

  const defaultToolDisabledMessage = isEditing
    ? "Det er ikke mulig å bruke dette verktøyet for denne inndelingen"
    : "Åpne en inndeling i redigeringsmodus for å aktivere";

  useKeyboardShortcut("add", () => toggleTool("add"), isEditing);
  useKeyboardShortcut("remove", () => toggleTool("remove"), isEditing);
  useKeyboardShortcut("movepoint", toggleMovePoint, isEditing);
  useKeyboardShortcut("merge", () => toggleOverlayPanel("sammenslåing"), isEditingStemmekrets);
  useKeyboardShortcut("archive", () => toggleTool("archive"), isEditing);
  useKeyboardShortcut("draw", () => toggleTool("draw"), isEditing);
  useKeyboardShortcut("grensesplit", () => toggleTool("split"), isEditing);
  useKeyboardShortcut("flatesplit", () => toggleOverlayPanel("splitting"), isEditing);
  useKeyboardShortcut("flatedata", () => toggleOverlayModal("flatedata"));
  useKeyboardShortcut("historiskeGrenser", () => toggleTool("historiskeGrenser"), isEditing);

  const showBigMenu = (activeOverlayPanel === null && isSmall) || (activeOverlayPanel !== null && isWide);

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
      isDisabled: !isEditing || isEditingBopliktomraader,
      onClick: () => toggleTool("split"),
      "aria-label": "Del en grense i to fra et punkt",
      command: KeyboardShortcuts["grensesplit"].displayString,
    },
    {
      label: "Arkiver grense",
      icon: <Icon icon="archive" />,
      command: KeyboardShortcuts["archive"].displayString,
      $isActive: activeTool === "archive",
      isDisabled: !isEditing || isEditingBopliktomraader,
      onClick: () => toggleTool("archive"),
      "aria-label": "Arkiver grense",
    },
    {
      label: "Slett grense",
      icon: <Icon icon="delete_forever" />,
      command: KeyboardShortcuts["delete"].displayString,
      $isActive: activeTool === "delete",
      isDisabled: !isEditing || isEditingBopliktomraader,
      onClick: () => toggleTool("delete"),
      "aria-label": "Slett grense",
    },
    {
      label: "Dupliser grense",
      icon: <Icon icon="copy_all" />,
      command: KeyboardShortcuts["duplicate"].displayString,
      $isActive: activeTool === "duplicate",
      isDisabled: !isEditing || isEditingBopliktomraader,
      onClick: () => toggleTool("duplicate"),
      "aria-label": "Dupliser grense",
    },
    {
      label: "Vis historiske grenser",
      icon: <Icon icon="history" />,
      command: KeyboardShortcuts["historiskeGrenser"].displayString,
      $isActive: activeTool === "historiskeGrenser",
      isDisabled: !isEditingStemmekretsOrGrunnkrets,
      onClick: () => toggleTool("historiskeGrenser"),
      "aria-label": "Vis historiske grenser",
    },
    {
      label: "Slå sammen grenser",
      icon: <Icon icon="merge" />,
      command: KeyboardShortcuts["merge_grenser"].displayString,
      $isActive: activeTool === "merge_grenser",
      isDisabled: !isEditingStemmekretsOrGrunnkrets,
      onClick: () => toggleTool("merge_grenser"),
      "aria-label": "Slå sammen grenser",
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
      isDisabled: !isEditingStemmekrets,
      onClick: () => toggleOverlayPanel("sammenslåing"),
      "aria-label": "Slå sammen stemmekretser",
      $tooltipTextOverride: "Åpne stemmekretser i redigeringsmodus for å slå sammen",
    },
    {
      label: "Splitt flate",
      icon: <Icon icon="splitscreen" />,
      $isActive: activeOverlayPanel === "splitting",
      isDisabled: !isEditingStemmekretsOrGrunnkrets,
      onClick: () => toggleOverlayPanel("splitting"),
      "aria-label": "Splitt flate",
      command: KeyboardShortcuts["flatesplit"].displayString,
    },
  ];
  return (
    <>
      <Divider orientation="vertical" />
      {showBigMenu && (
        <Flex gap="18px">
          <ToolbarMenu
            label="Punkt"
            icon={<Icon icon="adjust" weight={400} />}
            isDisabled={false}
            isActive={punktMenuItems.some((pmi) => pmi.$isActive)}
            tooltip="Punkt"
          >
            <MenuList>
              {punktMenuItems.map((pmi) =>
                pmi.isDisabled ? (
                  <CustomTooltip
                    text={pmi.$tooltipTextOverride ?? defaultToolDisabledMessage}
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
            icon={<Icon icon="timeline" weight={400} />}
            isDisabled={false}
            isActive={grenseMenuItems.some((gmi) => gmi.$isActive)}
            tooltip="Grense"
          >
            <MenuList>
              {grenseMenuItems.map((gmi) =>
                gmi.isDisabled ? (
                  <CustomTooltip
                    text={gmi.$tooltipTextOverride ?? defaultToolDisabledMessage}
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
            icon={<Icon icon="border_all" weight={400} />}
            isDisabled={false}
            isActive={flateMenuItems.some((fmi) => fmi.$isActive)}
            tooltip="Flate"
          >
            <MenuList>
              {flateMenuItems.map((fmi) =>
                fmi.isDisabled ? (
                  <CustomTooltip
                    text={fmi.$tooltipTextOverride ?? defaultToolDisabledMessage}
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
        </Flex>
      )}
      {!showBigMenu && (
        <ToolbarMenu
          label="Verktøy"
          icon={<Icon icon="handyman" weight={400} />}
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
                    text={pmi.$tooltipTextOverride ?? defaultToolDisabledMessage}
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
                    text={gmi.$tooltipTextOverride ?? defaultToolDisabledMessage}
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
                    text={fmi.$tooltipTextOverride ?? defaultToolDisabledMessage}
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
      )}
      <Divider orientation="vertical" />
    </>
  );
};

export default ToolbarMenus;
