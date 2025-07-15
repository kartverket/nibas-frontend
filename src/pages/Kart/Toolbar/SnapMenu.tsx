import { Box, CloseButton, Menu, MenuDivider, MenuItem, MenuList, Spacer, Switch, Text } from "@kvib/react";
import { useToolbar } from "contexts/ToolbarContext";
import { KeyboardShortcuts } from "hooks/keyboard-shortcuts/keyboard-shortcuts";
import { useKeyboardShortcut } from "hooks/keyboard-shortcuts/keyboard-shortcuts-hook";
import { styled } from "styled-components";
import MenuButtonWithChevron from "./MenuButtonWithChevron";
import SwitchWithShortcutDesc from "./SwitchWithShortcutDesc";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onToggle: () => void;
};

const SnapMenu = ({ isOpen, onClose, onToggle }: Props) => {
  const { activeModeTools, toggleModeTool, toggleDefaultSnapModeTools, toggleForcedSnapMode } = useToolbar();

  const toggleSnapping = () => {
    toggleDefaultSnapModeTools();
  };

  useKeyboardShortcut("snap", () => {
    toggleSnapping();
  });
  useKeyboardShortcut("snap_matrikkel", () => {
    toggleModeTool("snap_matrikkel");
  });
  useKeyboardShortcut("snap_nibas", () => {
    toggleModeTool("snap_nibas");
  });
  useKeyboardShortcut("snap_forced", () => {
    toggleForcedSnapMode();
  });
  return (
    <Menu closeOnSelect={false} closeOnBlur={false} onClose={onClose} isOpen={isOpen}>
      <MenuButtonWithChevron
        aria-label="Snap til andre grenser i kartet"
        isOpen={isOpen}
        onClick={onToggle}
        icon="close_fullscreen"
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
            onChange={() => toggleSnapping()}
          />
          <span>Snapping</span>
          <Text fontSize="sm" sx={{ color: "gray.600" }}>
            {KeyboardShortcuts["snap"].displayString}
          </Text>
          <Spacer />
          <CloseButton onClick={onClose} />
        </SnapMenuHeader>
        <MenuDivider />
        <StyledMenuItem>
          <Box w={"100%"}>
            <SwitchWithShortcutDesc
              value="egne"
              onChange={() => toggleModeTool("snap_nibas")}
              isChecked={activeModeTools.includes("snap_nibas")}
              shortcut={KeyboardShortcuts["snap_nibas"].displayString}
            >
              Snap til egne grenser
            </SwitchWithShortcutDesc>
          </Box>
        </StyledMenuItem>
        <StyledMenuItem>
          <Box w={"100%"}>
            <SwitchWithShortcutDesc
              value="matrikkel"
              onChange={() => toggleModeTool("snap_matrikkel")}
              isChecked={activeModeTools.includes("snap_matrikkel")}
              shortcut={KeyboardShortcuts["snap_matrikkel"].displayString}
            >
              Snap til eiendomsgrenser
            </SwitchWithShortcutDesc>
          </Box>
        </StyledMenuItem>
        <StyledMenuItem>
          <Box w={"100%"}>
            <SwitchWithShortcutDesc
              value="forced"
              onChange={() => toggleForcedSnapMode()}
              isChecked={activeModeTools.includes("snap_forced")}
              shortcut={KeyboardShortcuts["snap_forced"].displayString}
            >
              Tvungen snapping
            </SwitchWithShortcutDesc>
          </Box>
        </StyledMenuItem>
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
const StyledMenuItem = styled(MenuItem)`
  padding: 12px;
`;
export default SnapMenu;
