import { styled } from "styled-components";
import {
  Icon,
  Menu,
  MenuButton,
  MenuItem,
  MenuItemProps,
  MenuList,
} from "@kvib/react";
import ModeButton from "./ModeButton";
import { useEditAllGrenser } from "contexts/EditGrenserContext";
import { useOverlayPanel } from "contexts/OverlayPanelContext";
import { useToolbar } from "contexts/ToolbarContext";
import { useKeyboardShortcut } from "hooks/keyboard-shortcuts/keyboard-shortcuts-hook";
import CustomTooltip from "./CustomTooltip";

type MenuItems = (MenuItemProps & {
  $isActive: boolean;
  isDisabled: boolean;
  label: string;
})[];

const ToolbarMenus = () => {
  const { activePointMode, togglePointMode, toggleEditMode } = useToolbar();
  const { getCurrentlyEditingType } = useEditAllGrenser();
  const editingType = getCurrentlyEditingType();
  const { activeOverlayPanel, openOverlayPanel, closeOverlayPanel } =
    useOverlayPanel();

  const mergeIsActive = activeOverlayPanel === "sammenslåing";

  const flatedetaljerIsActive =
    activeOverlayPanel === "grunnkrets" || activeOverlayPanel === "stemmekrets";

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

  const toggleMove = () => {
    togglePointMode("koordinater");

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
  useKeyboardShortcut("add", () => togglePointMode("add"), isEditMode);
  useKeyboardShortcut("remove", () => togglePointMode("remove"), isEditMode);
  useKeyboardShortcut("edit", toggleMove, isEditMode);
  useKeyboardShortcut("snap", () => toggleEditMode("snap"), isEditMode);
  useKeyboardShortcut("merge", toggleMergePanel, editingType === "stemmekrets");

  // For å kunne vise at en meny er aktiv må vi kunne sjekke hvorvidt noen av menuitems er aktive
  // Korteste vei til mål da blir å kunne iterere gjennom menu items
  const grenseMenuItems: MenuItems = [
    /*
    {
      label: "Tegn ny grense",
      icon: <Icon icon="edit" />,
      $isActive: activePointMode === "draw",
      isDisabled: !isEditMode,
      onClick: () => togglePointMode("draw"),
      "aria-label": "Tegn en ny grense fra et punkt",
    },
    {
      label: "Splitt grense",
      icon: <Icon icon="location_off" />,
      $isActive: activePointMode === "split",
      isDisabled: !isEditMode,
      onClick: () => togglePointMode("split"),
      "aria-label": "Del en grense i to fra et punkt",
    },
    {
      label: "Løsriv grense",
      icon: <Icon icon="edit_location_alt" />,
      $isActive: activePointMode === "detach",
      isDisabled: !isEditMode,
      onClick: () => togglePointMode("detach"),
      "aria-label": "Løsriv grense fra et knutepunkt",
    },
    */
    {
      label: "Se/endre grenseinformasjon",
      icon: <Icon icon="live_help" />,
      $isActive: activePointMode === "metadata",
      isDisabled: false,
      onClick: toggleMetadata,
      "aria-label": "Se informasjon om grensen",
    },
    {
      label: "Arkiver grense",
      icon: <Icon icon="archive" />,
      $isActive: activePointMode === "archive",
      isDisabled: !isEditMode,
      onClick: () => togglePointMode("archive"),
      "aria-label": "Arkiver grense",
    },
  ];
  const punktMenuItems: MenuItems = [
    {
      label: "Flytt punkt med koordinater",
      icon: <Icon icon="ads_click" />,
      $isActive: activePointMode === "koordinater",
      isDisabled: !isEditMode,
      onClick: toggleMove,
      "aria-label": "Flytt punkt med koordinater",
    },
    {
      label: "Legg til punkt",
      icon: <Icon icon="add_location_alt" />,
      $isActive: activePointMode === "add",
      isDisabled: !isEditMode,
      onClick: () => togglePointMode("add"),
      "aria-label": "Legg til punkter",
    },
    {
      label: "Fjern punkt",
      icon: <Icon icon="wrong_location" />,
      $isActive: activePointMode === "remove",
      isDisabled: !isEditMode,
      onClick: () => togglePointMode("remove"),
      "aria-label": "Fjern punkter",
    },
  ];
  const flateMenuItems: MenuItems = [
    {
      label: "Se/endre flatedetaljer",
      icon: <Icon icon="edit_location_alt" />,
      isDisabled: !isEditMode,
      $isActive: flatedetaljerIsActive,
      onClick: toggleFlatedetaljer,
      "aria-label": "Se eller endre flatedetaljer for kretsen som redigeres",
    },
    {
      label: "Slå sammen flater",
      icon: <Icon icon="merge" />,
      $isActive: mergeIsActive,
      isDisabled: editingType !== "stemmekrets",
      onClick: toggleMergePanel,
      "aria-label": "Slå sammen stemmekretser",
    },
  ];

  return (
    <>
      <Menu autoSelect={false}>
        <CustomTooltip text={"Vis grenseverktøy"}>
          <MenuButton
            as={ModeButton}
            aria-label="Grenseverktøy"
            icon="show_chart"
            isDisabled={grenseMenuItems.every((gmi) => gmi.isDisabled)}
            isActive={grenseMenuItems.some((gmi) => gmi.$isActive)}
          >
            Grense
          </MenuButton>
        </CustomTooltip>
        <MenuList>
          {grenseMenuItems.map((gmi) => (
            <ToolbarMenuItem key={gmi.label} {...gmi}>
              {gmi.label}
            </ToolbarMenuItem>
          ))}
        </MenuList>
      </Menu>
      <Menu autoSelect={false}>
        <CustomTooltip text="Vis punktverktøy">
          <MenuButton
            as={ModeButton}
            aria-label="Punktverktøy"
            icon="conversion_path"
            isDisabled={punktMenuItems.every((pmi) => pmi.isDisabled)}
            isActive={punktMenuItems.some((pmi) => pmi.$isActive)}
          >
            Punkt
          </MenuButton>
        </CustomTooltip>
        <MenuList>
          {punktMenuItems.map((pmi) => (
            <ToolbarMenuItem key={pmi.label} {...pmi}>
              {pmi.label}
            </ToolbarMenuItem>
          ))}
        </MenuList>
      </Menu>
      <Menu autoSelect={false}>
        <CustomTooltip text="Vis flateverktøy">
          <MenuButton
            as={ModeButton}
            aria-label="Flateverktøy"
            icon="area_chart"
            isDisabled={flateMenuItems.every((fmi) => fmi.isDisabled)}
            isActive={flateMenuItems.some((fmi) => fmi.$isActive)}
          >
            Flate
          </MenuButton>
        </CustomTooltip>
        <MenuList>
          {flateMenuItems.map((fmi) => (
            <ToolbarMenuItem key={fmi.label} {...fmi}>
              {fmi.label}
            </ToolbarMenuItem>
          ))}
        </MenuList>
      </Menu>
    </>
  );
};

const ToolbarMenuItem = styled(MenuItem)<{ $isActive: boolean }>`
  background-color: ${(props) =>
    props.$isActive && "var(--kvib-colors-blue-50)"};
`;

export default ToolbarMenus;
