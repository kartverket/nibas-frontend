import { Box, CloseButton, Menu, MenuDivider, MenuList, Spacer, Switch, Text } from "@kvib/react";
import { CustomMagnetIcon } from "components/CustomIcons";
import { useToolbar } from "contexts/ToolbarContext";
import { KeyboardShortcuts } from "hooks/keyboard-shortcuts/keyboard-shortcuts";
import { useKeyboardShortcut } from "hooks/keyboard-shortcuts/keyboard-shortcuts-hook";
import { styled } from "styled-components";
import { TitleWithIconTooltip } from "../OverlayPanels/GrenseinformasjonPanel/TitleWithIconTooltip";
import MenuButtonWithChevron from "./MenuButtonWithChevron";
import SwitchWithShortcutDesc from "./SwitchWithShortcutDesc";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onToggle: () => void;
};

const SnapMenu = ({ isOpen, onClose, onToggle }: Props) => {
  const {
    activeModeTools,
    toggleDefaultSnapModeTools,
    toggleForcedSnapMode,
    toggleNibasSnapMode,
    toggleMatrikkelSnapMode,
  } = useToolbar();

  useKeyboardShortcut("snap", toggleDefaultSnapModeTools);
  useKeyboardShortcut("snap_matrikkel", toggleMatrikkelSnapMode);
  useKeyboardShortcut("snap_nibas", toggleNibasSnapMode);
  useKeyboardShortcut("snap_forced", toggleForcedSnapMode);
  return (
    <Menu closeOnSelect={false} closeOnBlur={false} onClose={onClose} isOpen={isOpen}>
      <MenuButtonWithChevron
        aria-label="Snap til andre grenser i kartet"
        isOpen={isOpen}
        onClick={onToggle}
        icon={<CustomMagnetIcon />}
        isActive={activeModeTools.includes("snap_nibas") || activeModeTools.includes("snap_matrikkel")}
        tooltip={{ text: "Snapping" }}
      >
        Snap
      </MenuButtonWithChevron>
      <MenuList minWidth="240px" marginBottom="10px">
        <SnapMenuHeader>
          <Switch
            aria-label="Slå av/på snapping"
            isChecked={
              activeModeTools.includes("snap_matrikkel") ||
              activeModeTools.includes("snap_nibas") ||
              activeModeTools.includes("snap_forced")
            }
            onChange={toggleDefaultSnapModeTools}
          />
          <span>Snapping</span>
          <Text fontSize="sm" sx={{ color: "gray.600" }}>
            {KeyboardShortcuts["snap"].displayString}
          </Text>
          <Spacer />
          <CloseButton onClick={onClose} />
        </SnapMenuHeader>
        <MenuDivider />
        <Box w={"100%"}>
          <SwitchWithShortcutDesc
            value="egne"
            onChange={toggleNibasSnapMode}
            isChecked={activeModeTools.includes("snap_nibas")}
            shortcut={KeyboardShortcuts["snap_nibas"].displayString}
          >
            Snap til egne grenser
          </SwitchWithShortcutDesc>
        </Box>

        <Box w={"100%"}>
          <SwitchWithShortcutDesc
            value="matrikkel"
            onChange={toggleMatrikkelSnapMode}
            isChecked={activeModeTools.includes("snap_matrikkel")}
            shortcut={KeyboardShortcuts["snap_matrikkel"].displayString}
          >
            Snap til eiendomsgrenser
          </SwitchWithShortcutDesc>
        </Box>

        <Box w={"100%"}>
          <SwitchWithShortcutDesc
            value="forced"
            onChange={toggleForcedSnapMode}
            isChecked={activeModeTools.includes("snap_forced")}
            shortcut={KeyboardShortcuts["snap_forced"].displayString}
          >
            <TitleWithIconTooltip
              placement="bottom"
              tooltipLabel="Tvungen snapping gjør det obligatorisk å snappe mot andre punkter eller linjer."
            >
              Tvungen snapping
            </TitleWithIconTooltip>
          </SwitchWithShortcutDesc>
        </Box>
      </MenuList>
    </Menu>
  );
};

const SnapMenuHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 12px;
`;

export default SnapMenu;
